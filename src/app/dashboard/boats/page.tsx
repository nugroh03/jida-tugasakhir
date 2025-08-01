'use client';

import React, { useEffect } from 'react';
import {
  Ship,
  Loader2,
  PlusCircle,
  Users,

  Edit,
} from 'lucide-react';

import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setListBoats, setLoading } from '@/lib/features/boatSlice';

// --- Komponen Badge Kategori ---
const CategoryBadge = ({ category }: { category: string }) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full capitalize';
  const style =
    category === 'wisata' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800';
  return <span className={`${baseClasses} ${style}`}>{category}</span>;
};

export default function ManageBoatsPage() {
  // const [boats, setBoats] = useState<Boat[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  // const [boats, setBoats] = useState<Boat[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const loading = useAppSelector((state) => state.boat.loading);
  const boats = useAppSelector((state) => state.boat.boats);

  const totalCapacity = boats.reduce((sum, boat) => sum + boat.capacity, 0);

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch('/api/v1/boats');
        if (!response.ok) {
          throw new Error('Gagal mengambil data kapal');
        }
        const result = await response.json();
        if (result.statusCode !== 200) {
          throw new Error(result.message || 'Terjadi kesalahan pada server');
        }
        dispatch(setListBoats(result.data));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.log(err);
        dispatch(setLoading(false));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (boats.length > 0) return;
    fetchBoats();
  }, [boats.length, dispatch]);

  return (
    <>
      <div className='p-4 md:p-8 bg-gray-50 min-h-screen'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>Kelola Kapal</h1>
            <p className='text-gray-600'>
              Tambah, edit, atau hapus data kapal dari armada Anda.
            </p>
          </div>
          <Link href='/dashboard/boats/add-boat'>
            <button className='mt-4 md:mt-0 flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg'>
              <PlusCircle className='h-5 w-5 mr-2' />
              Tambah Kapal
            </button>
          </Link>
        </div>

        {/* Stat Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-lg shadow-md flex items-center'>
            <div className='bg-blue-100 p-3 rounded-full mr-4'>
              <Ship className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Total Kapal</p>
              <p className='text-2xl font-bold text-gray-800'>{boats.length}</p>
            </div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow-md flex items-center'>
            <div className='bg-green-100 p-3 rounded-full mr-4'>
              <Users className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Total Kapasitas</p>
              <p className='text-2xl font-bold text-gray-800'>
                {totalCapacity.toLocaleString()} Orang
              </p>
            </div>
          </div>
          
        </div>

        {loading && (
          <div className='text-center py-12'>
            <Loader2 className='h-12 w-12 text-blue-700 mx-auto animate-spin' />
            <p className='mt-4 text-gray-600'>Memuat data kapal...</p>
          </div>
        )}

        {/* {error && (
          <div className='bg-red-50 border-l-4 border-red-400 p-4 text-center'>
            <ServerCrash className='h-8 w-8 text-red-600 mx-auto mb-2' />
            <p className='font-bold text-red-800'>Terjadi Kesalahan</p>
            <p className='text-red-700'>{error}</p>
          </div>
        )} */}

        {!loading && (
          <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
            <table className='w-full text-sm text-left text-gray-500'>
              <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                <tr>
                  <th scope='col' className='px-6 py-3'>Nama Kapal</th>
                  <th scope='col' className='px-6 py-3'>Tipe</th>
                  <th scope='col' className='px-6 py-3'>Kategori</th>
                  <th scope='col' className='px-6 py-3'>Kapasitas</th>
                  <th scope='col' className='px-6 py-3 text-center'>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {boats.map((boat) => (
                  <tr key={boat.id} className='bg-white border-b hover:bg-gray-50'>
                    <td className='px-6 py-4 font-medium text-gray-900 flex items-center'>
                      <Ship className='w-5 h-5 text-gray-400 mr-3' />
                      {boat.name}
                    </td>
                    <td className='px-6 py-4'>{boat.type}</td>
                    <td className='px-6 py-4'>
                      <CategoryBadge category={boat.category} />
                    </td>
                    <td className='px-6 py-4'>{boat.capacity} orang</td>
                    <td className='px-6 py-4 text-center'>
                      <Link href={`/dashboard/boats/${boat.id}`}>
                        <button className='font-medium text-blue-600 hover:underline flex items-center justify-center mx-auto'>
                          <Edit size={16} className='mr-1' /> Edit
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
