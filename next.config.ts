import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.reuters.com",
      },
      {
        protocol: "https",
        hostname: "**.bloomberg.com",
      },
      {
        protocol: "https",
        hostname: "**.ft.com",
      },
      {
        protocol: "https",
        hostname: "**.businessdayonline.com",
      },
      {
        protocol: "https",
        hostname: "**.businessday.ng",
      },
      {
        protocol: "https",
        hostname: "**.techcabal.com",
      },
      {
        protocol: "https",
        hostname: "**.theafricareport.com",
      },
      {
        protocol: "https",
        hostname: "**.africabusiness.com",
      },
      {
        protocol: "https",
        hostname: "**.quartz.com",
      },
      {
        protocol: "https",
        hostname: "**.qz.com",
      },
      {
        protocol: "https",
        hostname: "**.dailynation.co.ke",
      },
      {
        protocol: "https",
        hostname: "**.nation.africa",
      },
      {
        protocol: "https",
        hostname: "**.moneyweb.co.za",
      },
      {
        protocol: "https",
        hostname: "**.dailymaverick.co.za",
      },
      {
        protocol: "https",
        hostname: "**.aljazeera.com",
      },
      {
        protocol: "https",
        hostname: "**.africanews.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Enable ISR revalidation
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      ],
    },
  },

  // Pass through required environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Cache static market data pages with ISR
        source: "/markets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        // Cache article pages
        source: "/articles/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=7200",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
