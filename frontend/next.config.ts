import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://api:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      // Uploaded product images, served by the API off its media volume. Same
      // origin as the site, so next/image can optimise them.
      { source: "/media/:path*", destination: `${API_URL}/media/:path*` },
    ];
  },
};

export default nextConfig;
