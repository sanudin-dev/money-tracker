import { IntegrationStatusLine } from '@/components/ModeStatusLine'
import { ExpenseForm } from '@/components/ExpenseForm'

export const metadata = {
  title: 'Add Expense — Money Tracker',
  description: 'Log a new expense. Saved locally and synced to your configured integrations.',
}

export default function AddPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
          Add Expense
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Log your expenses locally or sync to your integration.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <IntegrationStatusLine />
        <ExpenseForm />
      </div>
    </div>
  )
}
