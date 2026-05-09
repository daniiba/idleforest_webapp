import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import LandingPageOriginal from '@/components/landing/LandingPageOriginal'
import LandingPageVideo from '@/components/landing/LandingPageVideo'
import LandingPageScreenshots from '@/components/landing/LandingPageScreenshots'
import { getDeviceInfo } from '@/lib/device-detection'
import { buildLocalizedAlternates, getLocalizedUrl } from '@/lib/carbon-routing'

const HOME_TITLE = 'Plant Trees For Free While Browsing | IdleForest - Passive Reforestation'
const HOME_DESCRIPTION = "Plant trees automatically without changing how you browse. IdleForest's browser extension uses idle bandwidth to fund reforestation, with no donations or search engine switch required."

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const url = getLocalizedUrl('', params.locale)

  return {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    alternates: buildLocalizedAlternates('', params.locale),
    openGraph: {
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
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
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: ['/preview.png'],
    },
  }
}

export default function LandingPage() {
  const cookieStore = cookies()
  const variant = cookieStore.get('ab-variant')?.value

  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const deviceInfo = getDeviceInfo(userAgent)

  // Default to video if no cookie or invalid variant
  switch (variant) {
    case 'original':
      return <LandingPageOriginal deviceInfo={deviceInfo} />
    case 'screenshots':
      return <LandingPageScreenshots deviceInfo={deviceInfo} />
    case 'video':
    default:
      return <LandingPageVideo deviceInfo={deviceInfo} />
  }
}
