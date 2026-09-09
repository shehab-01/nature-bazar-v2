import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://api:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  // These rewrites are served by Next's http-proxy: every request header,
  // Cookie included, is forwarded to the API unchanged (only x-forwarded-host
  // is added). The order POST and /api/track depend on that for the _fbp/_fbc
  // Pixel cookies, which is how server-side Meta events get matched.
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
