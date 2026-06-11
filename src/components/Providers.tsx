'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from 'next-themes'
import { ConfigProvider } from '@/hooks/useConfig'

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Cache the current page on every load so it's available offline.
  // cacheOnFrontEndNav only fires on pushState (in-app navigation); this covers
  // the initial page open which that mechanism misses.
  useEffect(() => {
    if (!('caches' in window)) return
    caches.open('pages').then((cache) => cache.add(pathname)).catch(() => {})
  }, [pathname])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ConfigProvider>{children}</ConfigProvider>
    </ThemeProvider>
  )
}
