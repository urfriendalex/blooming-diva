import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  /** Allow dev HMR when opening the site from another device on the LAN (e.g. phone). */
  allowedDevOrigins: ["192.168.50.120"],
};

export default nextConfig;
