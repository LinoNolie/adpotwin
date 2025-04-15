/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/adpotwin',
  images: {
    unoptimized: true
  },
  assetPrefix: '/adpotwin/'
}

module.exports = nextConfig
