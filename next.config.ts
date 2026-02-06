import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'waterpunten'; // Update this if your repo name is different

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : '',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repoName}` : '',
  }
};

export default nextConfig;
