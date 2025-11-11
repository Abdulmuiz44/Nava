import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nava - Intelligent Browser Automation',
  description: 'Automate your web browsing tasks with natural language commands',
  keywords: ['browser automation', 'web automation', 'playwright', 'ai automation'],
  authors: [{ name: 'Nava Team' }],
  openGraph: {
    title: 'Nava - Intelligent Browser Automation',
    description: 'Automate your web browsing tasks with natural language commands',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
