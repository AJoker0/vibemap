import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Не валим сборку на Vercel из-за ESLint
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google profile images
      'googleusercontent.com',     // Google images
      'accounts.google.com',       // Google account images
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
