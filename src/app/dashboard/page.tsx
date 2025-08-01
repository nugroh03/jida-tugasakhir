'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {

  Calendar,
  
  Ship,

} from 'lucide-react';

import { useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setListBoats, setLoading } from '@/lib/features/boatSlice';

const StatCardSkeleton = () => (
  <div className='bg-white rounded-lg shadow-sm p-6 animate-pulse'>
    <div className='flex items-center justify-between'>
      <div>
        <div className='h-4 bg-gray-200 rounded w-24 mb-2'></div>
        <div className='h-7 bg-gray-300 rounded w-16 mb-2'></div>
        <div className='h-3 bg-gray-200 rounded w-20'></div>
      </div>
      <div className='p-3 rounded-lg bg-gray-200 h-14 w-14'></div>
    </div>
  </div>
);

export default function Dashboard() {
  const {  status } = useSession();
    const dispatch = useAppDispatch();


    const isStatsLoading = useAppSelector((state) => state.boat.loading);
    const boats = useAppSelector((state) => state.boat.boats);


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

  // const handleLogout = () => {
  //   logout();
  //   router.push('/login');
  // };

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
      </div>
    );
  }

  // if (!session) {
  //   router.push('/login');
  //   return null;
  // }

  const dashboardStats = [
    {
      title: 'Total Kapal',
      value: boats.length || 0,
      icon: <Ship className='h-8 w-8 text-blue-600' />,
      color: 'bg-blue-100',
      change: '+2 bulan ini',
    },
    
  ];

  const quickActions = [
    {
      title: 'Kelola Kapal',
      description: 'Tambah, edit, atau hapus data kapal',
      href: '/dashboard/boats',
      icon: <Ship className='h-6 w-6' />,
      color: 'bg-blue-600 hover:bg-blue-700',
    },

    {
      title: 'Kelola Booking',
      description: 'Lihat dan kelola reservasi',
      href: '/dashboard/transactions',
      icon: <Calendar className='h-6 w-6' />,
      color: 'bg-orange-600 hover:bg-orange-700',
    },
   
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <Anchor className='h-8 w-8 text-blue-700 mr-3' />
              <h1 className='text-xl font-bold text-gray-900'>
                Marina Boat Dashboard
              </h1>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-600'>
                Selamat datang, <span className='font-medium'>{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className='flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors'
              >
                <LogOut className='h-4 w-4' />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header> */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Dashboard Admin
          </h2>
          <p className='text-gray-600'>
            Kelola armada kapal dan operasional Marina Boat
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {isStatsLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))
            : dashboardStats.map((stat, index) => (
                <div
                  key={index}
                  className='bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600 mb-1'>
                        {stat.title}
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {stat.value}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Quick Actions */}
        <div className='mb-8'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Aksi Cepat
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className='block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 hover:transform hover:-translate-y-1'
              >
                <div
                  className={`inline-flex p-3 rounded-lg text-white mb-4 ${action.color}`}
                >
                  {action.icon}
                </div>
                <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                  {action.title}
                </h4>
                <p className='text-gray-600 text-sm'>{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

       
      </div>
    </div>
  );
}
