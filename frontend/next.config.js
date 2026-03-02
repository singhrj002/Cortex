/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Optimizes the build for Docker environments
  images: {
    domains: ['logo.clearbit.com'],
  },
};

module.exports = nextConfig;