import type { Metadata } from 'next'
import { headers } from 'next/headers'
import LandingPageVideo from '@/components/landing/LandingPageVideo'
import { getDeviceInfo } from '@/lib/device-detection'
import { buildLocalizedAlternates, getLocalizedUrl } from '@/lib/carbon-routing'
import { getLocaleMeta, HOME_META_BY_LOCALE } from '@/lib/seo-locales'

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const url = getLocalizedUrl('', params.locale)
  const meta = getLocaleMeta(HOME_META_BY_LOCALE, params.locale)

  return {
    title: meta.title,
    description: meta.description,
    alternates: buildLocalizedAlternates('', params.locale),
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: 'IdleForest',
      type: 'website',
      images: [
        {
          url: '/preview.png',
          width: 1280,
          height: 800,
          alt: 'IdleForest - plant trees while you browse',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/preview.png'],
    },
  }
}

export default function LandingPage() {
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const deviceInfo = getDeviceInfo(userAgent)

  return <LandingPageVideo deviceInfo={deviceInfo} />
}
