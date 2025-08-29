/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental.appDir as it's no longer needed in Next.js 14
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
