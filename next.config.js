/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  // Turbopack disabled for build stability
  // turbopack: {},
  serverExternalPackages: [
    'pino-pretty',
    'lokijs',
    'encoding',
    '@react-native-async-storage/async-storage',
  ],
  async rewrites() {
    return [
      {
        source: '/api/rybbit/:path*',
        destination: 'https://analytics.pzza.works/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
