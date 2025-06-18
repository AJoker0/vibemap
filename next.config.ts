//next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    IPINFO_TOKEN: process.env.IPINFO_TOKEN,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
