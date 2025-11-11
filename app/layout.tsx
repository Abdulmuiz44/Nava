import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Terminal, Layers, Camera, RotateCcw } from 'lucide-react'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Nava - Intelligent Browser Automation',
  description: 'Automate your web browsing tasks with natural language commands',
  keywords: ['browser automation', 'web automation', 'playwright', 'ai automation', 'PWA', 'mobile automation'],
  authors: [{ name: 'Nava Team' }],
  metadataBase: new URL('https://nava.app'),
  openGraph: {
    title: 'Nava - Intelligent Browser Automation',
    description: 'Automate your web browsing tasks with natural language commands',
    type: 'website',
    siteName: 'Nava',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Nava - Intelligent Browser Automation'
    }],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nava',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nava" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col`}>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <MobileNav />
        <Analytics />
      </body>
    </html>
  )
}

// Mobile Navigation Component
function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center p-2">
        <Link href="/" className="flex flex-col items-center p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
          <Terminal className="h-6 w-6" />
          <span className="text-xs mt-1">Automate</span>
        </Link>
        <Link href="/workflows" className="flex flex-col items-center p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
          <Layers className="h-6 w-6" />
          <span className="text-xs mt-1">Workflows</span>
        </Link>
        <Link href="/screenshots" className="flex flex-col items-center p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
          <Camera className="h-6 w-6" />
          <span className="text-xs mt-1">Screenshots</span>
        </Link>
        <Link href="/history" className="flex flex-col items-center p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
          <RotateCcw className="h-6 w-6" />
          <span className="text-xs mt-1">History</span>
        </Link>
      </div>
    </nav>
  )
}
