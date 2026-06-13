import { HistoryWrapper } from '@/components/HistoryWrapper'
import { ListIcon } from 'lucide-react'

export const metadata = {
  title: 'Money Tracker',
  description:
    'Track personal expenses locally. Sync via webhook or Google Sheets API. Works offline.',
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
