/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // re-enable ESLint during builds; address lint issues instead of ignoring
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'LinkTik',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

module.exports = nextConfig;
