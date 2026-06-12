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
  description:
    'Track personal expenses locally or sync to Google Sheets. Works offline. Installable as a PWA.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://mt.sanudin.dev'),
  openGraph: {
    title: 'Money Tracker',
    description:
      'Track personal expenses locally or sync to Google Sheets. Works offline. Installable as a PWA.',
    url: 'https://mt.sanudin.dev',
    siteName: 'Money Tracker',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Money Tracker',
    description:
      'Track personal expenses locally or sync to Google Sheets. Works offline. Installable as a PWA.',
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
    <html lang="en" className={`${geist.className} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        <Providers>
          <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
                Money Tracker
              </Link>
              {/* Hidden on mobile — bottom tab bar handles navigation */}
              <nav className="hidden items-center gap-1 sm:flex">
                <Link
                  href="/compare"
                  className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  Integrations
                </Link>
              </nav>
            </div>
          </header>
          {/* pb-24 reserves space above the floating bottom nav on all screen sizes */}
          <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 pb-24">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
