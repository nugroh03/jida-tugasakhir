'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Boat } from '@prisma/client';

export default function OrderPage() {
  // Gunakan hook useSession untuk mendapatkan data sesi dan statusnya
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Boat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hanya fetch data jika user sudah terotentikasi dan memiliki ID
    if (status === 'authenticated' && session?.user?.id) {
      const fetchBookings = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/v1/bookings?userId=${session.user.id}`);
          if (!res.ok) {
            throw new Error('Gagal mengambil data pemesanan dari server.');
          }
          const apiResponse = await res.json();
          if (apiResponse.statusCode !== 200) {
            throw new Error(apiResponse.message || 'Terjadi kesalahan pada server.');
          }
          setBookings(apiResponse.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchBookings();
    } else if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status, session]);

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
          {isLoading ? (
            <div className='flex justify-center items-center p-8'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-700' />
              <p className='ml-4 text-gray-600'>Memuat riwayat orderan...</p>
            </div>
          ) : error ? (
            <div className='text-center p-8 bg-red-50 text-red-700 rounded-lg'>
              <p>
                <strong>Error:</strong> {error}
              </p>
            </div>
          ) : bookings.length > 0 ? (
            <ul className='space-y-4'>
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className='p-4 border rounded-md flex justify-between items-center'
                >
                  <div>
                    <p className='font-semibold'>
                      Order #{booking.orderId.substring(0, 8)} -{' '}
                      {booking.boat.name}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Tanggal:{' '}
                      {new Date(booking.bookingDate).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      booking.paymentStatus === 'PAID'
                        ? 'text-green-800 bg-green-100'
                        : 'text-yellow-800 bg-yellow-100'
                    }`}
                  >
                    {booking.paymentStatus}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className='text-center p-8 bg-gray-50 text-gray-500 rounded-lg'>
              <p>Anda belum memiliki riwayat pemesanan.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
