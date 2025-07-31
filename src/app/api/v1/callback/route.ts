import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Ambil data dari body callback Duitku
    const {
      merchantOrderId,
      resultCode,
      reference,
      signature: duitkuSignature,
      amount,
    } = body;

    console.log('Received Duitku callback:', body);

    // Ambil kredensial dari environment
    const merchantCode = process.env.DUITKU_MERCHANT_CODE;
    const apiKey = process.env.DUITKU_API_KEY;

    if (!merchantCode || !apiKey) {
      console.error('Duitku merchant code or API key is not set.');
      return NextResponse.json(
        { status: 'ERROR', message: 'Internal Server Error' },
        { status: 500 }
      );
    }

    // --- PENTING: Verifikasi Signature ---
    // Pastikan format signature untuk callback sesuai dengan dokumentasi Duitku.
    // Format ini adalah contoh umum dan mungkin perlu disesuaikan.
    // Contoh: sha256(merchantCode + amount + merchantOrderId + apiKey)
    const signatureString = `${merchantCode}${amount}${merchantOrderId}${apiKey}`;
    const localSignature = createHash('sha256')
      .update(signatureString)
      .digest('hex');

    if (duitkuSignature !== localSignature) {
      console.error('Invalid signature.', {
        duitkuSignature,
        localSignature,
        signatureString,
      });
      return NextResponse.json(
        { status: 'ERROR', message: 'Invalid Signature' },
        { status: 400 }
      );
    }

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
