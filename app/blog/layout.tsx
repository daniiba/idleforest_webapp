import Navigation from '@/components/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Idle Forest Blog',
  description: 'Thoughts and insights about technology, programming, and more',
  openGraph: {
    title: 'Idle Forest Blog',
    description: 'Thoughts and insights about technology, programming, and more',
    type: 'website',
    siteName: 'Idle Forest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Idle Forest Blog',
    description: 'Thoughts and insights about technology, programming, and more',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <><Navigation  />{children}</>
}
