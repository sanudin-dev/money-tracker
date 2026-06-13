import { SetupTabs } from '@/components/SetupTabs'
import { BookOpenIcon } from 'lucide-react'

export const metadata = {
  title: 'Guide — Money Tracker',
  description: 'Step-by-step setup guide for Webhook and Sheets API integrations.',
}

export default function GuidePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <BookOpenIcon className="h-6 w-6" />
          Setup Guide
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Pick your integration and follow the steps.
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Steps may be outdated as platforms update their UI.{' '}
          <a
            href="https://github.com/sanudin-dev/money-tracker/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Report an issue on GitHub
          </a>{' '}
          if something looks wrong.
        </p>
      </div>

      <SetupTabs />
    </div>
  )
}
