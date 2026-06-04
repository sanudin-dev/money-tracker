import { HistoryWrapper } from '@/components/HistoryWrapper'

export const metadata = {
  title: 'Money Tracker',
  description: 'Track personal expenses locally. Sync via webhook or Google Sheets API. Works offline.',
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
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
