/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: reactStrictMode is intentionally disabled.
  // react-leaflet's MapContainer initializes the Leaflet map imperatively in
  // a DOM ref callback. With React 18 strict mode, components mount → unmount
  // → remount in dev, which causes Leaflet to re-initialize the same <div>
  // and throw "Map container is already initialized."
  reactStrictMode: false,
  swcMinify: true,
  
  // Enable experimental features if needed
  experimental: {},
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.tile.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: '*.unpkg.com',
      },
    ],
  },
  
  // Async component loading
  compiler: {
    styledComponents: false,
  },
}

module.exports = nextConfig
