import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  webpack(config) {
    // Modify Webpack config here
    return config;
  },
};

export default nextConfig;
