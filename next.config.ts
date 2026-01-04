import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Optimize font loading
  optimizeFonts: true,
  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
