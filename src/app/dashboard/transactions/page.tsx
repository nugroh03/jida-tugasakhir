'use client';

import { useState, useEffect } from 'react';
import { Eye, Loader2, ServerCrash } from 'lucide-react';
import type { Booking, User, Boat, BookingStatus,  } from '@prisma/client';
import BookingDetailModal from '@/components/dashboard/BookingDetailModal';

// --- Tipe Data Baru ---
type BookingWithDetails = Booking & {
  user: User;
  boat: Boat;
};

// --- Komponen Status Badge ---
const BookingStatusBadge = ({ status }: { status: BookingStatus }) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
  const statusClasses = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status.replace('_', ' ')}</span>;
};

export default function TransactionsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/v1/bookings');
        if (!res.ok) {
          throw new Error('Gagal memuat data transaksi dari server.');
        }
        const apiResponse = await res.json();
        console.log('check' + apiResponse)
        if (apiResponse.statusCode !== 200) {
          throw new Error(apiResponse.message || 'Gagal memuat data.');
        }
        setBookings(apiResponse.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Terjadi kesalahan yang tidak diketahui.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleViewDetails = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  return (
    <>
      <div className='p-8'>
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Manajemen Transaksi
          </h2>
          <p className='text-gray-600'>Lihat dan kelola semua transaksi.</p>
        </div>
        {loading && (
          <div className='text-center py-12'>
            <Loader2 className='h-12 w-12 text-blue-700 mx-auto animate-spin' />
            <p className='mt-4 text-gray-600'>Memuat data transaksi...</p>
          </div>
        )}
        {error && (
          <div className='bg-red-50 border-l-4 border-red-400 p-4 text-center'>
            <ServerCrash className='h-8 w-8 text-red-600 mx-auto mb-2' />
            <p className='font-bold text-red-800'>Terjadi Kesalahan</p>
            <p className='text-red-700'>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
            <table className='w-full text-sm text-left text-gray-500'>
              <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                <tr>
                  <th scope='col' className='px-6 py-3'>ID Booking</th>
                  <th scope='col' className='px-6 py-3'>Pelanggan</th>
                  <th scope='col' className='px-6 py-3'>Tanggal Pesan</th>
                  <th scope='col' className='px-6 py-3'>Tanggal Booking</th>
                  <th scope='col' className='px-6 py-3'>Total</th>
                  <th scope='col' className='px-6 py-3'>Status</th>
                  <th scope='col' className='px-6 py-3 text-center'>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className='bg-white border-b hover:bg-gray-50'>
                    <td className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>{booking.orderId}</td>
                    <td className='px-6 py-4'>{booking.user.name}</td>
                    <td className='px-6 py-4'>{new Date(booking.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className='px-6 py-4'>{new Date(booking.bookingDate).toLocaleDateString('id-ID')}</td>
                    <td className='px-6 py-4'>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(booking.totalPrice)}</td>
                    <td className='px-6 py-4'><BookingStatusBadge status={booking.status} /></td>
                    <td className='px-6 py-4 text-center'>
                      <button onClick={() => handleViewDetails(booking)} className='font-medium text-blue-600 hover:underline flex items-center justify-center mx-auto'>
                        <Eye size={16} className='mr-1' /> Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedBooking && <BookingDetailModal booking={selectedBooking} onClose={handleCloseModal} />}
    </>
  );
}
