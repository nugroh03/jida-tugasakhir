/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getKeteranganPembayaran(kode: string) {
  const pembayaranMap :any = {
    // Credit Card
    VC: "(Visa / Master Card / JCB)",

    // Virtual Account
    BC: "BCA Virtual Account",
    M2: "Mandiri Virtual Account",
    VA: "Maybank Virtual Account",
    I1: "BNI Virtual Account",
    B1: "CIMB Niaga Virtual Account",
    BT: "Permata Bank Virtual Account",
    A1: "ATM Bersama",
    AG: "Bank Artha Graha",
    NC: "Bank Neo Commerce/BNC",
    BR: "BRIVA",
    S1: "Bank Sahabat Sampoerna",
    DM: "Danamon Virtual Account",
    BV: "BSI Virtual Account",

    // Ritel
    FT: "Pegadaian/ALFA/Pos",
    IR: "Indomaret",

    // E-Wallet
    OV: "OVO (Support Void)",
    SA: "ShopeePay Apps (Support Void)",
    LF: "LinkAja Apps (Fixed Fee)",
    LA: "LinkAja Apps (Percentage Fee)",
    DA: "DANA",
    SL: "ShopeePay Account Link",
    OL: "OVO Account Link",
    JP: "Jenius Pay",

    // QRIS
    SP: "ShopeePay",
    NQ: "Nobu",
    DQ: "Dana",
    GQ: "Gudang Voucher",
    SQ: "Nusapay",

    // Credit (Paylater)
    DN: "Indodana Paylater",
    AT: "ATOME"
  };

  return pembayaranMap[kode] || "Kode tidak dikenal";
}

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any;

    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      throw new Error(`Unsupported content-type: ${contentType}`);
    }

    // Ambil data dari body callback Duitku
    const {
      merchantOrderId,
      resultCode,
      reference,
      paymentCode,
    } = body;

    console.log('Received Duitku callback:', body);

    // // Ambil kredensial dari environment
    // const merchantCode = process.env.DUITKU_MERCHANT_CODE;
    // const apiKey = process.env.DUITKU_API_KEY;

    // if (!merchantCode || !apiKey) {
    //   console.error('Duitku merchant code or API key is not set.');
    //   return NextResponse.json(
    //     { status: 'ERROR', message: 'Internal Server Error' },
    //     { status: 500 }
    //   );
    // }

    // // --- PENTING: Verifikasi Signature ---
    // // Pastikan format signature untuk callback sesuai dengan dokumentasi Duitku.
    // // Format ini adalah contoh umum dan mungkin perlu disesuaikan.
    // // Contoh: sha256(merchantCode + amount + merchantOrderId + apiKey)
    // const timestamp = Math.round(Date.now());

    // // const timestamp = getJakartaTimestamp();
    // console.log('Jakarta timestamp:', timestamp);
    // const signatureString = `${merchantCode}${timestamp}${apiKey}`;
    // const localSignature = crypto.createHash('sha256').update(signatureString).digest('hex');

    // if (duitkuSignature !== localSignature) {
    //   console.error('Invalid signature.', {
    //     duitkuSignature,
    //     localSignature,
    //     signatureString,
    //   });
    //   return NextResponse.json(
    //     { status: 'ERROR', message: 'Invalid Signature' },
    //     { status: 400 }
    //   );
    // }

    // --- PROSES STATUS PEMBAYARAN ---
    // Cari booking berdasarkan merchantOrderId
    const booking = await prisma.booking.findUnique({
      where: { orderId: merchantOrderId },
    });

    if (!booking) {
      console.error(`Booking with orderId ${merchantOrderId} not found.`);
      return NextResponse.json(
        { status: 'ERROR', message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update status booking berdasarkan resultCode dari Duitku
    const newStatus = resultCode === '00' ? 'SUCCESS' : 'FAILED';

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: newStatus == 'SUCCESS' ? 'CONFIRMED' : 'CANCELLED',
        paymentStatus: newStatus == 'SUCCESS' ? 'PAID' : 'FAILED',
        paymentReference: reference, // Simpan referensi pembayaran dari Duitku
        paymentCode: paymentCode,
        peymentDescrition: getKeteranganPembayaran(paymentCode),
      },
    });

    console.log(`Booking ${merchantOrderId} updated to ${newStatus}`);

    // Beri respon ke Duitku bahwa callback telah diterima dan diproses
    return NextResponse.json({ status: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Duitku callback error:', error);
    return NextResponse.json({ status: 'ERROR', message: (error as Error).message }, { status: 500 });
  }
}
