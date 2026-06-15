import { HistoryWrapper } from '@/components/HistoryWrapper'
import { ListIcon } from 'lucide-react'

export const metadata = {
  title: 'Money Tracker',
  description:
    'Your local expense history. Browse by month, export to CSV, and sync with Google Sheets or Notion.',
  openGraph: {
    title: 'Money Tracker',
    description:
      'Your local expense history. Browse by month, export to CSV, and sync with Google Sheets or Notion.',
    url: '/',
    siteName: 'Money Tracker',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Money Tracker',
    description:
      'Your local expense history. Browse by month, export to CSV, and sync with Google Sheets or Notion.',
  },
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ListIcon className="h-6 w-6" />
          History
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your expense log. Add new expenses from the{' '}
          <a href="/add" className="underline underline-offset-2">
            Add
          </a>{' '}
          page.
        </p>
      </div>

      <HistoryWrapper />
    </div>
  )
}
