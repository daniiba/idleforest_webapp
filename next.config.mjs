/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.hashnode.com',
      },
      {
        protocol: 'https',
        hostname: 'www.olostep.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/carbon-footprint-of-:slug',
        destination: '/carbon-footprint/:slug',
      },
    ];
  },
};

export default nextConfig;
