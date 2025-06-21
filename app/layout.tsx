import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'TheJuneBerry - Premium Pakistani Dresses & Fashion',
    template: '%s | TheJuneBerry'
  },
  description: 'Discover authentic Pakistani fashion at TheJuneBerry. Premium dresses, live fashion shows, and exclusive collections delivered across Pakistan. Shop traditional and modern styles.',
  keywords: ['Pakistani dresses', 'premium fashion', 'live fashion shows', 'traditional clothing', 'modern Pakistani wear', 'online clothing store Pakistan'],
  authors: [{ name: 'TheJuneBerry' }],
  creator: 'TheJuneBerry',
  publisher: 'TheJuneBerry',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://thejuneberry.vercel.app'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thejuneberry.vercel.app',
    title: 'TheJuneBerry - Premium Pakistani Dresses & Fashion',
    description: 'Discover authentic Pakistani fashion at TheJuneBerry. Premium dresses, live fashion shows, and exclusive collections delivered across Pakistan.',
    siteName: 'TheJuneBerry',
    images: [
      {
        url: '/images/favicon.jpg', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'TheJuneBerry Premium Pakistani Fashion',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheJuneBerry - Premium Pakistani Dresses & Fashion',
    description: 'Discover authentic Pakistani fashion at TheJuneBerry. Premium dresses, live fashion shows, and exclusive collections.',
    images: ['/images/favicon.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <link rel="icon" href="/favicon.jpg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        
        <meta name="facebook-domain-verification" content="your-facebook-domain-verification-code" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "TheJuneBerry",
              "description": "Premium Pakistani fashion and dresses",
              "url": "https://thejuneberry.vercel.app",
              "logo": "https://thejuneberry.vercel.app/images/favicon.jpg",
              "sameAs": [
                "https://facebook.com/thejuneberry1"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": "English"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
            {children}
            <Toaster />
      </body>
    </html>
  )
}