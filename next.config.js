/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
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
};

module.exports = nextConfig;
