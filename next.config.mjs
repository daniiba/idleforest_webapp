/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
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
      {
        protocol: 'https',
        hostname: 'ufsnmvbmgwvkhirfnptm.supabase.co',
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
