import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Install — Money Tracker',
  description: 'Install Money Tracker as a PWA on Android, iOS, or desktop for offline access.',
  openGraph: {
    title: 'Install — Money Tracker',
    description: 'Install Money Tracker as a PWA on Android, iOS, or desktop for offline access.',
    url: '/install',
    siteName: 'Money Tracker',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Install — Money Tracker',
    description: 'Install Money Tracker as a PWA on Android, iOS, or desktop for offline access.',
  },
}

export default function InstallLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
