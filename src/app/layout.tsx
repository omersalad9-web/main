import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { MarketTicker } from '@/components/layout/MarketTicker'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Africa Finance Review',
    template: '%s · Africa Finance Review',
  },
  description:
    'Investment intelligence across the African continent. Real-time market analysis, country profiles, and sector insights for the diaspora investor.',
  keywords: [
    'Africa finance',
    'African markets',
    'NGX',
    'JSE',
    'diaspora investment',
    'African equities',
    'emerging markets',
  ],
  authors: [{ name: 'Africa Finance Review' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://africafinancereview.com',
    siteName: 'Africa Finance Review',
    title: 'Africa Finance Review',
    description:
      'Investment intelligence across the African continent. For the diaspora investor.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Africa Finance Review',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Africa Finance Review',
    description: 'Investment intelligence across the African continent.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-cream text-ink antialiased">
        <MarketTicker />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
