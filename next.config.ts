import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Ubah sesuai kebutuhan (default: 1mb)
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        // port: '',
        // pathname: '/photos/**',
      },
    ],
  },
};

export default nextConfig;
