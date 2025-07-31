/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import {  useParams, useRouter } from 'next/navigation';

import FeatureIcon from '@/components/featureicon';
import { Boat } from '@/types';
import { useSession } from 'next-auth/react';

// interface BoatDetailProps {
//   params: {
//     id: string;
//   };
// }

// export async function generateMetadata({ params }: BoatDetailProps) {
//   const resolvedParams = await params;
//   const boat = getBoatById(parseInt(resolvedParams.id));

//   if (!boat) {
//     return {
//       title: 'Kapal tidak ditemukan - Marina Boat',
//     };
//   }

//   return {
//     title: `${boat.name} - Marina Boat`,
//     description: boat.description,
//   };
// }

export default function BoatDetail() {
  const params = useParams();
  const boatId = parseInt(params.id as string, 10);
    const { data: session, status } = useSession();
  
  

  

  console.log(boatId);

  const [boat, setBoats] = useState<Boat>({} as Boat);
  const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // State untuk form pemesanan
  const [bookingDate, setBookingDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [duration, setDuration] = useState(4); // Durasi default 4 jam
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  // const boat = getBoatById(parseInt(resolvedParams.id));

  useEffect(() => {
    const fetchBoat = async () => {
      try {
        console.log('Start');
        setIsLoading(true);
        const response = await fetch(`/api/v1/boats/${boatId}`);
        if (!response.ok) {
          throw new Error(`Gagal mengambil data kapal: ${response.status}`);
        }

        const result = await response.json();
        const boatData: Boat = result.data;

        console.log(boatData);

        setBoats(boatData);

        // Set form data dengan data yang sudah ada
      } catch (error: any) {
        // setError(error.message || 'Terjadi kesalahan saat memuat data kapal.');
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(boatId)) {
      fetchBoat();
    }
  }, [boatId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    setBookingError(null);

    if (status === 'unauthenticated') {
      setBookingError(
        'Anda harus login terlebih dahulu untuk membuat pemesanan.'
      );
      setIsBooking(false);
      return;
    }

    if (!bookingDate) {
      setBookingError('Silakan pilih tanggal sewa.');
      setIsBooking(false);
      return;
    }

    // Asumsi userId didapat dari sesi login, untuk sekarang kita hardcode
    const userId = session?.user?.id;
    const totalPrice = boat.priceNum * duration;

    try {
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boatId,
          userId,
          bookingDate: new Date(bookingDate).toISOString(),
          numberOfGuests,
          duration,
          totalPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat pemesanan.');
      }

      // Redirect ke halaman sukses atau halaman transaksi
      router.push('/booking-success');
    } catch (error: any) {
      setBookingError(
        error.message || 'Terjadi kesalahan saat membuat pemesanan.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-blue-600' />
          <p className='text-gray-600'>Memuat data kapal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='py-8'>
      {/* Breadcrumb */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8'>
        <Link
          href='/'
          className='flex items-center text-blue-700 hover:text-blue-800 mb-4'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Kembali ke Beranda
        </Link>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            {/* Image Gallery */}
            <div className='mb-8'>
              <div className='relative h-96 rounded-lg overflow-hidden shadow-lg mb-4'>
                {boat.image !== '' && (
                  <Image
                    src={boat.image}
                    alt={boat.name}
                    fill
                    className='object-cover'
                    priority
                  />
                )}
              </div>
              <div className='grid grid-cols-3 gap-4'>
                {boat.gallery.map((image, index) => (
                  <div
                    key={index}
                    className='relative h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity'
                  >
                    <Image
                      src={image}
                      alt={`${boat.name} ${index + 1}`}
                      fill
                      className='object-cover'
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Boat Info */}
            <div className='mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                    {boat.name}
                  </h1>
                  <p className='text-lg text-gray-600'>{boat.type}</p>
                </div>
                <div className='flex items-center'>
                  <Star className='h-5 w-5 text-yellow-400 fill-current' />
                  <span className='text-lg font-semibold ml-1'>
                    {boat.rating}
                  </span>
                  <span className='text-gray-600 ml-1'>
                    ({boat.reviews} ulasan)
                  </span>
                </div>
              </div>

              <div className='flex items-center mb-6'>
                <Users className='h-5 w-5 text-gray-500 mr-2' />
                <span className='text-gray-700'>
                  Kapasitas {boat.capacity} orang
                </span>
              </div>

              <p className='text-gray-600 leading-relaxed mb-8'>
                {boat.description}
              </p>

              {/* Features */}
              <div className='mb-8'>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                  Fasilitas
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {boat.features.map((feature, index) => (
                    <div key={index} className='flex items-center space-x-2'>
                      <div className='text-blue-700'>
                        <FeatureIcon iconName={feature.icon} />
                      </div>
                      <span className='text-gray-700'>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className='mb-8'>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                  Spesifikasi
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  {Object.entries(boat.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className='flex justify-between border-b border-gray-200 pb-2'
                    >
                      <span className='text-gray-600'>{key}</span>
                      <span className='text-gray-900 font-medium'>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Includes */}
              <div className='mb-8'>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                  Yang Sudah Termasuk
                </h3>
                <div className='space-y-2'>
                  {boat.includes.map((item, index) => (
                    <div key={index} className='flex items-center space-x-2'>
                      <CheckCircle className='h-5 w-5 text-green-600' />
                      <span className='text-gray-700'>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destinations */}
              <div className='mb-8'>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                  Destinasi Populer
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                  {boat.destinations.map((destination, index) => (
                    <div key={index} className='flex items-center space-x-2'>
                      <MapPin className='h-4 w-4 text-blue-700' />
                      <span className='text-gray-700'>{destination}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className='lg:col-span-1'>
            <form onSubmit={handleBooking} className='bg-white rounded-lg shadow-lg p-6 sticky top-24'>
              <div className='mb-6'>
                <div className='text-3xl font-bold text-orange-600 mb-2'>
                  {boat.price}
                  <span className='text-lg text-gray-500 font-normal'>
                    /hari
                  </span>
                </div>
                <p className='text-gray-600'>
                  Harga sudah termasuk BBM dan crew
                </p>
              </div>

              <div className='space-y-4 mb-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Tanggal Sewa
                  </label>
                  <input
                    type='date'
                    className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Jumlah Orang
                  </label>
                  <select
                    className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                  >
                    {Array.from({ length: boat.capacity }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} orang
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Durasi (jam)
                  </label>
                  <select
                    className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                  >
                    <option value='4'>4 jam</option>
                    <option value='6'>6 jam</option>
                    <option value='8'>8 jam</option>
                    <option value='12'>12 jam</option>
                  </select>
                </div>
              </div>

              {bookingError && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4' role='alert'>
                  <span className='block sm:inline'>{bookingError}</span>
                </div>
              )}

              <button
                type='submit'
                disabled={isBooking}
                className='w-full bg-blue-700 text-white py-3 rounded-md font-semibold hover:bg-blue-800 transition-colors mb-4 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center'
              >
                {isBooking && (
                  <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                )}
                {isBooking ? 'Memproses...' : 'Pesan Sekarang'}
              </button>

              <div className='space-y-3 text-sm'>
                <div className='flex items-center space-x-2'>
                  <Phone className='h-4 w-4 text-blue-700' />
                  <span className='text-gray-700'>+62 812-3456-7890</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Mail className='h-4 w-4 text-blue-700' />
                  <span className='text-gray-700'>info@marinaboat.com</span>
                </div>
              </div>

              <div className='mt-4 p-3 bg-blue-50 rounded-md'>
                <p className='text-sm text-blue-800'>
                  <strong>Gratis Konsultasi:</strong> Hubungi kami untuk
                  mendapatkan rekomendasi paket terbaik sesuai kebutuhan Anda.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
