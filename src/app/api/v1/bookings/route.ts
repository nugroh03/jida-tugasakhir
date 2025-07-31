import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

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
    return NextResponse.json({
      statusCode: 500,
      message: (error as Error).message,
    }, { status: 500 });
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
    // Memulai transaksi database
  
      // Ambil data kapal dan user menggunakan transaction client (tx)
      const [boat, user] = await Promise.all([
        prisma.boat.findUnique({
          where: { id: boatId },
        }),
        prisma.user.findUnique({ where: { id: userId } }),
      ]);

      if (!boat) {
        // Melempar error akan otomatis me-rollback transaksi
        throw new Error('Kapal tidak ditemukan.');
      }

      if (!user) {
        // Melempar error akan otomatis me-rollback transaksi
        throw new Error('User tidak ditemukan.');
      }

      // Hitung total harga di server untuk keamanan
      const totalPrice = boat.priceNum;

      // --- PROSES INTEGRASI DUITKU ---
      const merchantCode = process.env.DUITKU_MERCHANT_CODE;
      const apiKey = process.env.DUITKU_API_KEY;
      const duitkuCallbackUrl = process.env.DUITKU_CALLBACK_URL;
      const duitkuReturnUrl = process.env.DUITKU_RETURN_URL;
      const duitkuApiUrl =
        process.env.DUITKU_API_URL ||
        'https://api-sandbox.duitku.com/api/merchant/createInvoice';

      if (!merchantCode || !apiKey || !duitkuCallbackUrl || !duitkuReturnUrl) {
        console.error('Duitku environment variables are not set');
        // Melempar error akan otomatis me-rollback transaksi
        throw new Error('Konfigurasi payment gateway tidak lengkap.');
      }

      const orderId = generateOrderId();
      const timestamp = Date.now();
      // Signature untuk membuat invoice, pastikan sesuai dokumentasi Duitku
      // const signature = createHash('sha256')
      //   .update(`${merchantCode}${orderId}${totalPrice}${apiKey}`)
      //   .digest('hex');

      console.log('Duitku merchant code:', merchantCode);
      console.log('Duitku API key:', apiKey);
      console.log('Duitku callback URL:', duitkuCallbackUrl);
      console.log('Duitku return URL:', duitkuReturnUrl);
      console.log('Duitku API URL:', duitkuApiUrl);

      const signatureRaw = `${merchantCode}-${timestamp}-${apiKey}`;
const signature = createHash('sha256').update(signatureRaw).digest('hex');

      const duitkuPayload = {
        merchantCode: merchantCode,
        paymentAmount: totalPrice,
        merchantOrderId: orderId,
        productDetails: `Booking for ${boat.name}`,
        customerVaName: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '081234567890', // Ganti dengan nomor telepon user jika ada
        itemDetails: [
          {
            name: `Sewa Kapal ${boat.name}`,
            price: totalPrice,
            quantity: 1,
          },
        ],
        callbackUrl: duitkuCallbackUrl,
        returnUrl: duitkuReturnUrl,
        expiryPeriod: 60, // dalam menit
      };

      console.log('Duitku payload:', duitkuPayload);
      console.log('Duitku signature:', signature);


      const duitkuResponse = await fetch(duitkuApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-duitku-timestamp': String(timestamp),
          'x-duitku-signature': signature,
          'x-duitku-merchantcode': merchantCode,
        },
        body: JSON.stringify(duitkuPayload),
      });

      const duitkuData = await duitkuResponse.json();

      if (!duitkuResponse.ok || duitkuData.resultCode !== '00') {
        console.error('Duitku API Error:', duitkuData);
        // Melempar error akan otomatis me-rollback transaksi
        throw new Error(
          duitkuData.resultMessage || 'Gagal membuat invoice pembayaran.'
        );
      }

      // Buat booking di DB *setelah* invoice berhasil dibuat
      const newBooking = await prisma.booking.create({
        data: {
          orderId: orderId,
          boatId,
          userId,
          bookingDate: new Date(bookingDate),
          numberOfGuests,
          totalPrice,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          snapRedirectUrl: duitkuData.paymentUrl || '',
          paymentReference: duitkuData.reference || null,
        },
      });

      // Kembalikan data yang akan digunakan di response
      const result = { ...newBooking, paymentUrl: duitkuData.paymentUrl, reference: duitkuData.reference };


    // Jika transaksi berhasil, kirim response sukses
    return NextResponse.json({
      statusCode: 201,
      message: 'Pemesanan berhasil dibuat, silahkan lanjutkan pembayaran.',
      data: result,
    }, { status: 201 });

  } catch (error) {
    console.error('Booking creation error:', error);
    const errorMessage = (error as Error).message;
    let statusCode = 500;

    if (errorMessage.includes('ditemukan')) {
      statusCode = 404;
    } else if (errorMessage.includes('Konfigurasi payment gateway')) {
      statusCode = 500;
    } else if (errorMessage.includes('invoice pembayaran')) {
      statusCode = 502; // Bad Gateway, karena ada masalah dengan upstream (Duitku)
    }

    return NextResponse.json(
      {
        statusCode: statusCode,
        message: errorMessage || 'Terjadi kesalahan pada server saat membuat pemesanan.',
      },
      { status: statusCode }
    );
  }
}
