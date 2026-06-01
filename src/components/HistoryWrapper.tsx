'use client'

import dynamic from 'next/dynamic'

const HistoryClient = dynamic(
  () => import('@/components/HistoryClient').then((m) => ({ default: m.HistoryClient })),
  { ssr: false }
)

export function HistoryWrapper() {
  return <HistoryClient />
}
