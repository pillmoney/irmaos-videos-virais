import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendUrl}/:path*`,
      },
      {
        source: '/static/downloads/:path*',
        destination: `${backendUrl}/static/downloads/:path*`,
      },
    ];
  },
};

export default nextConfig;
