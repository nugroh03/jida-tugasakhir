'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';

export default function OrderPage() {
  // Gunakan hook useSession untuk mendapatkan data sesi dan statusnya
  const { data: session, status } = useSession();

  // Selama sesi sedang diperiksa (loading), tampilkan pesan loading.
  // Ini mencegah "kedipan" konten yang tidak terotentikasi.
  if (status === 'loading') {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]'>
        <Loader2 className='h-12 w-12 animate-spin text-blue-700' />
        <p className='mt-4 text-gray-600'>Memuat data sesi...</p>
      </div>
    );
  }

  // Jika pengguna tidak terotentikasi, tampilkan pesan untuk login.
  if (status === 'unauthenticated') {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center p-4'>
        <h1 className='text-2xl font-bold text-gray-800 mb-4'>Akses Ditolak</h1>
        <p className='text-gray-600 mb-6 max-w-md'>
          Anda harus login terlebih dahulu untuk dapat mengakses halaman ini.
        </p>
        <Link
          href='/login'
          className='inline-flex items-center bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors'
        >
          <LogIn className='h-5 w-5 mr-2' />
          Login Sekarang
        </Link>
      </div>
    );
  }

  // Jika pengguna sudah terotentikasi, tampilkan konten halaman orderan.
  if (status === 'authenticated') {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Halaman Orderan Anda
        </h1>
        <p className='text-lg text-gray-600 mb-8'>
          Selamat datang, {session.user?.name || 'Pengguna'}!
        </p>
        <div className='bg-white p-8 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Daftar Orderan</h2>
          <p className='text-gray-500 mb-6'>
            Berikut adalah riwayat pemesanan kapal Anda.
          </p>
          {/* Di sini Anda bisa menambahkan logika untuk fetch dan menampilkan data orderan */}
          <ul className='space-y-4'>
            <li className='p-4 border rounded-md flex justify-between items-center'>
              <div>
                <p className='font-semibold'>Orderan #12345 - Ocean Explorer</p>
                <p className='text-sm text-gray-500'>Tanggal: 25 Desember 2024</p>
              </div>
              <span className='px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full'>
                Selesai
              </span>
            </li>
            <li className='p-4 border rounded-md flex justify-between items-center'>
              <div>
                <p className='font-semibold'>Orderan #67890 - Fishing Master</p>
                <p className='text-sm text-gray-500'>Tanggal: 10 Januari 2025</p>
              </div>
              <span className='px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full'>
                Dalam Pengiriman
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return null;
}
