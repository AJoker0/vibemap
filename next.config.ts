import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep hot-reload output separate from production builds.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  images: {
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
  // Leaflet accesses browser APIs, so keep it out of the server bundle.
  serverExternalPackages: ['leaflet'],
};

export default nextConfig;
