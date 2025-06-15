//next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    IPINFO_TOKEN: process.env.IPINFO_TOKEN,
  },
};

export default nextConfig;
