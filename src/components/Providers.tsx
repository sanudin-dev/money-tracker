'use client'

import type { ReactNode } from 'react'
import { ConfigProvider } from '@/hooks/useConfig'

export function Providers({ children }: { children: ReactNode }) {
  return <ConfigProvider>{children}</ConfigProvider>
}
