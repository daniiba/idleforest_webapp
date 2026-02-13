import { cookies, headers } from 'next/headers'
import LandingPageOriginal from '@/components/landing/LandingPageOriginal'
import LandingPageVideo from '@/components/landing/LandingPageVideo'
import LandingPageScreenshots from '@/components/landing/LandingPageScreenshots'
import { getDeviceInfo } from '@/lib/device-detection'

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
