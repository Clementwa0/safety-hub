import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer (used by the invoice PDF export route) bundles
  // Yoga's WASM/native layout engine, which relies on `__dirname` and
  // other Node-specific resolution that breaks if webpack tries to
  // bundle it. Marking it external keeps it as a plain `require` at
  // runtime instead.
  serverExternalPackages: ["@react-pdf/renderer"],

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