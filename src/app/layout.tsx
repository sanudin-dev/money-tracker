import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import { Providers } from '@/components/Providers'
import { BottomNav } from '@/components/BottomNav'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#18181b',
}

export const metadata: Metadata = {
  title: 'Money Tracker',
  description: 'Track personal expenses locally or sync to Google Sheets. Works offline. Installable as a PWA.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://mt.sanudin.dev'),
  openGraph: {
    title: 'Money Tracker',
    description: 'Track personal expenses locally or sync to Google Sheets. Works offline. Installable as a PWA.',
    url: 'https://mt.sanudin.dev',
    siteName: 'Money Tracker',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Money Tracker',
    description: 'Track personal expenses locally or sync to Google Sheets. Works offline. Installable as a PWA.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Money Tracker',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.className} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        <Providers>
          <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
              <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Money Tracker
              </Link>
              {/* Hidden on mobile — bottom tab bar handles navigation */}
              <nav className="hidden items-center gap-1 sm:flex">
                <Link href="/add" className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                  Add
                </Link>
                <Link href="/compare" className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                  Integrations
                </Link>
                <Link href="/settings" className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                  Settings
                </Link>
              </nav>
            </div>
          </header>
          {/* pb-20 on mobile reserves space above the fixed bottom tab bar */}
          <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 pb-24 sm:pb-8">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
