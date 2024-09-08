/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['replicate.com', 'replicate.delivery', 'storage.googleapis.com'],
  },
}

module.exports = nextConfig
