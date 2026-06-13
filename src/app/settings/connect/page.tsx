import { Link2Icon } from 'lucide-react'
import Link from 'next/link'
import { ConfigForm } from '@/components/ConfigForm'

export const metadata = {
  title: 'Connect — Money Tracker',
  description: 'Connect a webhook or Google Sheets to sync your expenses automatically.',
}

export default function ConnectPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Link2Icon className="h-6 w-6" />
          Connect
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Configure your integrations. Both can be active at the same time.
        </p>
        <div className="mt-1 flex flex-col gap-2.5">
          <Link
            href="/settings/guide"
            className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            Need help setting up? See the guide →
          </Link>
          <Link
            href="/compare"
            className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            Not sure which to use? Compare integrations →
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <ConfigForm />
      </div>
    </div>
  )
}
