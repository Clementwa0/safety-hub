import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  allowedDevOrigins: ["192.168.1.100","192.168.0.109"],
};

export default nextConfig;