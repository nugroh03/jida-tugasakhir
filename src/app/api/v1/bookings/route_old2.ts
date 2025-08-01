/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import moment from 'moment-timezone';

import crypto,  from 'crypto';

function getJakartaTimestamp() {
  const now = new Date();
  // Konversi ke timezone Jakarta (UTC+7)
  const jakartaTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return jakartaTime.getTime(); // dalam milliseconds
}

// Fungsi untuk membuat signature
function createSignature(merchantCode: any, timestamp: any, apiKey: any) {
  const signatureString = `${merchantCode}-${timestamp}-${apiKey}`;
  return crypto.createHash('sha256').update(signatureString).digest('hex');
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true, // Sertakan data user yang mendaftar
        boat: true, // Sertakan data kapal yang dipesan
      },
      orderBy: {
        createdAt: 'desc', // Urutkan dari yang terbaru
      },
    });

    return NextResponse.json({
      statusCode: 200,
      message: 'Success',
      data: bookings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        statusCode: 500,
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

const generateOrderId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BOOK-${year}${month}${day}-${randomPart}`;
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { boatId, userId, bookingDate, numberOfGuests } = body;

  // Validasi input sederhana
  if (!boatId || !userId || !bookingDate || !numberOfGuests) {
    return NextResponse.json(
      {
        statusCode: 400,
        message: 'Data pemesanan tidak lengkap. Semua field wajib diisi.',
      },
      { status: 400 }
    );
  }

  try {
    // Ambil data kapal dan user
    const [boat, user] = await Promise.all([
      prisma.boat.findUnique({
        where: { id: boatId },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!boat) {
      throw new Error('Kapal tidak ditemukan.');
    }

    if (!user) {
      throw new Error('User tidak ditemukan.');
    }

    // Hitung total harga di server untuk keamanan
    const totalPrice = boat.priceNum;

    // --- PROSES INTEGRASI MIDTRANS ---
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const midtransApiUrl ='https://app.sandbox.midtrans.com/snap/v1/transactions';

    if (!serverKey) {
      console.error('Midtrans server key is not set');
      throw new Error('Konfigurasi payment gateway tidak lengkap.');
    }

    const orderId = generateOrderId();

    // Create Midtrans payload
    const midtransPayload = {
     
      transaction_details: {
        order_id: orderId,
        gross_amount: totalPrice,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phoneNumber || '081234567890',
      },
          credit_card:{
        secure : true
    },
      item_details: [
        {
          id: boat.id,
          price: totalPrice,
          quantity: 1,
          name: `Sewa Kapal ${boat.name}`,
          category: 'Boat Rental',
        },
      ],
      custom_expiry: {
        expiry_duration: 60,
        unit: 'minute',
      },
    };

    // Encode server key untuk Basic Auth
    const authString = Buffer.from(serverKey + ':').toString('base64');

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authString}`,
    };

    console.log('Midtrans headers:', headers);
    console.log('Midtrans payload:', midtransPayload);

    const midtransResponse = await fetch(midtransApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(midtransPayload),
    });

    const midtransData = await midtransResponse.json();

    console.log('Midtrans response:', midtransData);

    // Untuk Snap API, success response hanya mengandung token dan redirect_url
    if (!midtransResponse.ok) {
      console.error('Midtrans API Error (HTTP):', midtransResponse.status, midtransData);
      throw new Error(
        midtransData.error_messages?.[0] || `HTTP Error: ${midtransResponse.status}`
      );
    }

    // Snap API success jika ada token dan redirect_url
    if (!midtransData.token || !midtransData.redirect_url) {
      console.error('Midtrans Snap Error:', midtransData);
      throw new Error(
        midtransData.error_messages?.[0] || 'Gagal membuat Snap token.'
      );
    }

    // Buat booking di DB *setelah* transaksi berhasil dibuat
   await prisma.booking.create({
      data: {
        orderId: orderId,
        boatId,
        userId,
        bookingDate: new Date(bookingDate),
        numberOfGuests,
        totalPrice,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        snapRedirectUrl: midtransData.redirect_url,
        paymentReference: midtransData.transaction_id || null,
      },
    });

    // Kembalikan data yang akan digunakan di response
    const result = {
      paymentUrl: midtransData.redirect_url,
      transactionId: midtransData.transaction_id,
     
    };

    console.log(result);

    return NextResponse.json(
      {
        statusCode: 201,
        message: 'Pemesanan berhasil dibuat, silahkan lanjutkan pembayaran.',
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking creation error:', error);
    const errorMessage = (error as Error).message;
    let statusCode = 500;

    if (errorMessage.includes('ditemukan')) {
      statusCode = 404;
    } else if (errorMessage.includes('Konfigurasi payment gateway')) {
      statusCode = 500;
    } else if (errorMessage.includes('transaksi pembayaran')) {
      statusCode = 502; // Bad Gateway, karena ada masalah dengan upstream (Midtrans)
    }

    return NextResponse.json(
      {
        statusCode: statusCode,
        message:
          errorMessage ||
          'Terjadi kesalahan pada server saat membuat pemesanan.',
      },
      { status: statusCode }
    );
  }
}
