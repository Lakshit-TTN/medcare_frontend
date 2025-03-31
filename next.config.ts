import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["jbdental.co.uk","localhost","res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000", // Add your backend port
      },
    ],
  },
};

export default nextConfig;
