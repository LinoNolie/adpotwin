/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: '/adpotwin',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
