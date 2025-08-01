'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Home, LayoutDashboard } from 'lucide-react';

const SuccessContent = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('merchantOrderId');
  const reference = searchParams.get('reference');
  const status = searchParams.get('resultCode'); // Duitku uses resultCode

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center'>
        <div className='flex justify-center mb-6'>
          <CheckCircle2 className='h-20 w-20 text-green-500' />
        </div>
        <h1 className='text-3xl font-bold text-gray-900 mb-3'>
          Pembayaran Berhasil!
        </h1>
        <p className='text-gray-600 mb-6'>
          Terima kasih! Pesanan Anda telah kami terima dan pembayaran telah
          berhasil dikonfirmasi.
        </p>

        {orderId && (
          <div className='bg-gray-100 rounded-lg p-4 mb-6 text-left text-sm'>
            <div className='flex justify-between mb-2'>
              <span className='font-semibold text-gray-700'>Status:</span>
              <span className='text-green-600 font-bold'>
                {status === '00' ? 'SUCCESS' : 'COMPLETED'}
              </span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='font-semibold text-gray-700'>Order ID:</span>
              <span className='font-mono'>{orderId}</span>
            </div>
            {reference && (
              <div className='flex justify-between'>
                <span className='font-semibold text-gray-700'>
                  Referensi Pembayaran:
                </span>
                <span className='font-mono'>{reference}</span>
              </div>
            )}
          </div>
        )}

        <p className='text-gray-500 text-sm mb-8'>
          Detail pemesanan telah dikirimkan ke email Anda. Anda dapat melihat
          riwayat pemesanan Anda di dashboard.
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/order'
            className='flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full'
          >
            <LayoutDashboard className='h-5 w-5' />
            <span>Lihat Booking Saya</span>
          </Link>
          <Link
            href='/'
            className='flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors w-full'
          >
            <Home className='h-5 w-5' />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          Memuat...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

