/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${process.env.BACKEND_INTERNAL_URL || 'http://localhost:8081'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
