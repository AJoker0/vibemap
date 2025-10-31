/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Do not fail the build on ESLint errors in CI (Vercel)
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
}

module.exports = nextConfig