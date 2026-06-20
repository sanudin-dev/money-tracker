import Link from 'next/link'
import { CurrencyRow } from '@/components/CurrencyRow'
import { IntegrationRow } from '@/components/IntegrationRow'
import { ThemeRow } from '@/components/ThemeRow'
import {
  ArrowRightLeftIcon,
  BookOpenIcon,
  ChevronRightIcon,
  CodeXmlIcon,
  Link2Icon,
  TabletSmartphoneIcon,
  SettingsIcon,
} from 'lucide-react'

export const metadata = {
  title: 'Settings — Money Tracker',
  description: 'Manage your integrations, currency, and app settings.',
  openGraph: {
    title: 'Settings — Money Tracker',
    description: 'Manage your integrations, currency, and app settings.',
    url: '/settings',
    siteName: 'Money Tracker',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Settings — Money Tracker',
    description: 'Manage your integrations, currency, and app settings.',
  },
}

type Row = {
  href: string
  label: string
  description: string
  iconBg: string
  icon: React.ReactNode
}

const ROWS: Row[] = [
  {
    href: '/settings/connect',
    label: 'Connect',
    description: 'Set up webhook, Sheets API or Notion credentials',
    iconBg: 'bg-blue-500',
    icon: <Link2Icon className="h-5 w-5" />,
  },
  {
    href: '/settings/guide',
    label: 'Guide',
    description: 'Step-by-step setup instructions',
    iconBg: 'bg-emerald-500',
    icon: <BookOpenIcon className="h-5 w-5" />,
  },
  {
    href: '/install',
    label: 'Install',
    description: 'Add to home screen on Android, iOS, or desktop',
    iconBg: 'bg-sky-500',
    icon: <TabletSmartphoneIcon className="h-5 w-5" />,
  },
  {
    href: '/compare',
    label: 'Integrations',
    description: 'See what Webhook, Sheets API and Notion each offer',
    iconBg: 'bg-violet-500',
    icon: <ArrowRightLeftIcon className="h-5 w-5" />,
  },
  {
    href: '/dev',
    label: 'Developer',
    description: 'Technical setup and implementation details',
    iconBg: 'bg-orange-500',
    icon: <CodeXmlIcon className="h-5 w-5" />,
  },
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your integration and learn how Money Tracker works.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {ROWS.map((row, i) => (
          <Link
            key={row.href}
            href={row.href}
            className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
              i < ROWS.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${row.iconBg}`}
            >
              {row.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{row.label}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{row.description}</p>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <IntegrationRow />
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <CurrencyRow />
        </div>
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <ThemeRow />
        </div>
      </div>

      <footer className="flex flex-col items-center gap-1.5 py-4 text-center">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Money Tracker{' '}
          <span className="font-normal text-zinc-400 dark:text-zinc-500">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </span>
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Local-first expense tracking. Sync via webhook, Google Sheets API or Notion.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/privacy"
            className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400"
          >
            Privacy Policy
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <a
            href="https://github.com/sanudin-dev/money-tracker/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400"
          >
            Report an issue
          </a>
        </div>
      </footer>
    </div>
  )
}
