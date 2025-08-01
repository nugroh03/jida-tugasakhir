import { Boat, Booking, BookingStatus, PaymentStatus, User } from "@prisma/client";
import { X } from "lucide-react";


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

const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
  const statusClasses = {
    UNPAID: 'bg-gray-100 text-gray-800',
    PAID: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};


export default function BookingDetailModal({ booking, onClose }: { booking: BookingWithDetails; onClose: () => void; }) {
 
    
        if (!booking) return null;
      
        return (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl relative'>
              <button onClick={onClose} className='absolute top-4 right-4 text-gray-500 hover:text-gray-800'>
                <X size={24} />
              </button>
              <h3 className='text-2xl font-bold mb-4'>Detail Booking: {booking.orderId}</h3>
              <div className='grid grid-cols-2 gap-4 mb-6'>
                <div><p className='text-sm text-gray-500'>Pelanggan</p><p className='font-semibold'>{booking.user.name}</p></div>
                <div><p className='text-sm text-gray-500'>Tanggal Pemesanan</p><p className='font-semibold'>{new Date(booking.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                <div><p className='text-sm text-gray-500'>Tanggal Booking</p><p className='font-semibold'>{new Date(booking.bookingDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                <div><p className='text-sm text-gray-500'>Status Booking</p><BookingStatusBadge status={booking.status} /></div>
                <div><p className='text-sm text-gray-500'>Status Pembayaran</p><PaymentStatusBadge status={booking.paymentStatus} /></div>
                <div><p className='text-sm text-gray-500'>Metode Pembayaran</p><p className='font-semibold'>{booking.peymentDescrition}</p></div>
                <div><p className='text-sm text-gray-500'>Jumlah Tamu</p><p className='font-semibold'>{booking.numberOfGuests} orang</p></div>
                <div><p className='text-sm text-gray-500'>Total</p><p className='font-semibold'>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(booking.totalPrice)}</p></div>
              </div>
              <h4 className='text-lg font-semibold mb-2 border-t pt-4'>Item Transaksi</h4>
              <div className='overflow-x-auto'>
                <table className='w-full text-left'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='p-2'>Produk</th>
                      <th className='p-2'>Tipe</th>
                      <th className='p-2 text-right'>Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='border-b'>
                      <td className='p-2'>{booking.boat.name}</td>
                      <td className='p-2'>{booking.boat.type}</td>
                      <td className='p-2 text-right'>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(booking.boat.priceNum)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      




}