import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  /** Allow dev HMR when opening the site from another device on the LAN (e.g. phone). */
  allowedDevOrigins: ["192.168.50.120"],
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon.svg",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
