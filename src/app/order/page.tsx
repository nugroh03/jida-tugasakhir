"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Eye, Loader2, LogIn, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Boat, Booking } from "@prisma/client";

interface BookingWithDetails extends Booking {
  boat: Boat;
  paymentMethod?: string | null;
}
export default function OrderPage() {
  // Gunakan hook useSession untuk mendapatkan data sesi dan statusnya
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithDetails | null>(null);

  useEffect(() => {
    // Hanya fetch data jika user sudah terotentikasi dan memiliki ID
    if (status === "authenticated" && session?.user?.id) {
      const fetchBookings = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/v1/bookings?userId=${session.user.id}`);
          if (!res.ok) {
            throw new Error("Gagal mengambil data pemesanan dari server.");
          }
          const apiResponse = await res.json();
          if (apiResponse.statusCode !== 200) {
            throw new Error(
              apiResponse.message || "Terjadi kesalahan pada server."
            );
          }
          setBookings(apiResponse.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchBookings();
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status, session]);

  // Selama sesi sedang diperiksa (loading), tampilkan pesan loading.
  // Ini mencegah "kedipan" konten yang tidak terotentikasi.
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-700" />
        <p className="mt-4 text-gray-600">Memuat data sesi...</p>
      </div>
    );
  }

  // Jika pengguna tidak terotentikasi, tampilkan pesan untuk login.
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          Anda harus login terlebih dahulu untuk dapat mengakses halaman ini.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
          <LogIn className="h-5 w-5 mr-2" />
          Login Sekarang
        </Link>
      </div>
    );
  }

  // Jika pengguna sudah terotentikasi, tampilkan konten halaman orderan.
  if (status === "authenticated") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Halaman Orderan Anda
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Selamat datang, {session.user?.name || "Pengguna"}!
        </p>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-4">
            Daftar Orderan
          </h2>
          <p className="text-gray-500 mb-6">
            Berikut adalah riwayat pemesanan kapal Anda.
          </p>
          {/* Di sini Anda bisa menambahkan logika untuk fetch dan menampilkan data orderan */}
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
              <p className="ml-4 text-gray-600">Memuat riwayat orderan...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg">
              <p>
                <strong>Error:</strong> {error}
              </p>
            </div>
          ) : bookings.length > 0 ? (
            <ul className="space-y-4">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    {/* Left side: Booking Info */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-5">
                        <Eye onClick={() => setSelectedBooking(booking)} />
                        <div>
                          <p className="text-sm text-gray-500">
                            Order ID: {booking.orderId}
                          </p>
                          <h3 className="text-lg font-bold text-gray-800">
                            {booking.boat.name}
                          </h3>
                        </div>
                      </div>

                      {/* <p className='text-sm text-gray-600 mt-1'>
                        Tanggal Booking:{' '}
                        {new Date(booking.bookingDate).toLocaleDateString(
                          'id-ID',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                      <p className='text-sm text-gray-600'>
                        Jumlah Tamu: {booking.numberOfGuests} orang
                      </p> */}
                    </div>

                    {/* Right side: Status & Actions */}
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <p className="text-lg font-semibold text-blue-700">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(booking.totalPrice)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            booking.status === "CONFIRMED"
                              ? "text-green-800 bg-green-100"
                              : booking.status === "CANCELLED"
                              ? "text-red-800 bg-red-100"
                              : "text-gray-800 bg-gray-100"
                          }`}
                        >
                          {booking.status}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            booking.paymentStatus === "PAID"
                              ? "text-green-800 bg-green-100"
                              : "text-yellow-800 bg-yellow-100"
                          }`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>
                      {booking.paymentStatus !== "PAID" &&
                        booking.snapRedirectUrl && (
                          <Link
                            href={booking.snapRedirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-green-700 transition-colors"
                          >
                            Lanjutkan Pembayaran
                          </Link>
                        )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-8 bg-gray-50 text-gray-500 rounded-lg">
              <p>Anda belum memiliki riwayat pemesanan.</p>
            </div>
          )}
        </div>

        {/* Modal Detail Pesanan */}
        {selectedBooking && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            onClick={() => setSelectedBooking(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Detail Pesanan
                </h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Tutup modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Detail Pesanan */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-700">
                    Informasi Pesanan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <p className="text-gray-500">Order ID</p>
                    <p className="font-mono text-gray-800">
                      {selectedBooking.orderId}
                    </p>
                    <p className="text-gray-500">Tanggal Pesan</p>
                    <p className="text-gray-800">
                      {new Date(selectedBooking.createdAt).toLocaleString(
                        "id-ID",
                        {
                          dateStyle: "full",
                          timeStyle: "short",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Detail Kapal */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-700">
                    Detail Kapal & Jadwal
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <p className="text-gray-500">Nama Kapal</p>
                    <p className="font-semibold text-gray-800">
                      {selectedBooking.boat.name}
                    </p>
                    <p className="text-gray-500">Tanggal Booking</p>
                    <p className="text-gray-800">
                      {new Date(selectedBooking.bookingDate).toLocaleDateString(
                        "id-ID",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </p>
                    <p className="text-gray-500">Jumlah Tamu</p>
                    <p className="text-gray-800">
                      {selectedBooking.numberOfGuests} orang
                    </p>
                  </div>
                </div>

                {/* Detail Pembayaran */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-700">
                    Detail Pembayaran
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <p className="text-gray-500">Total Harga</p>
                    <p className="font-bold text-lg text-blue-700">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(selectedBooking.totalPrice)}
                    </p>
                    <p className="text-gray-500">Status Pembayaran</p>
                    <p className="font-semibold text-gray-800">
                      {selectedBooking.paymentStatus}
                    </p>
                    <p className="text-gray-500">Metode Pembayaran</p>
                    <p className="text-gray-800">
                      {selectedBooking.peymentDescrition}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold text-sm hover:bg-gray-300 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
