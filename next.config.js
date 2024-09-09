/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['replicate.com', 'replicate.delivery', 'storage.googleapis.com', 'firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig
