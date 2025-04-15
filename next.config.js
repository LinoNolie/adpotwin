/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Only use basePath in production build, not for local development
  basePath: process.env.NODE_ENV === 'production' ? '/adpotwin' : '',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
