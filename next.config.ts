import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // URL-only image management: every module (products, categories,
    // banners, testimonials, ...) stores a plain HTTPS image URL rather than
    // an uploaded file, and admins can point at any public image host
    // (Cloudinary, ImageKit, S3, Supabase/Firebase Storage, GitHub raw
    // content, a CDN, etc.). Rather than hand-maintaining a hostname
    // allowlist here every time someone adds a new provider, we allow any
    // HTTPS host and rely on `lib/image-url.ts` + `ImageUrlInput` to
    // validate/preview URLs at save time, and `SafeImage` to fall back to a
    // local placeholder if a URL ever stops resolving.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Some image URLs (e.g. logos/icons) are SVGs.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  allowedDevOrigins: ["192.168.1.122"],

  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/sentinel/dashboard",
        permanent: true,
      },
      {
        source: "/admin/:path*",
        destination: "/sentinel/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;