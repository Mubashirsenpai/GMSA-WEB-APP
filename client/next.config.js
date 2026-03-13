/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Production: set NEXT_PUBLIC_API_URL e.g. https://your-api.com/api
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const base = apiBase.replace(/\/api\/?$/, "");
    return [
      { source: "/api/:path*", destination: `${apiBase}/:path*` },
      { source: "/socket.io/:path*", destination: `${base}/socket.io/:path*` },
    ];
  },
};

module.exports = nextConfig;
