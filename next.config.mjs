import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

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
      {
        protocol: 'https',
        hostname: 'd1yei2z3i6k35z.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '1clickimpact.com',
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

export default withNextIntl(nextConfig);
