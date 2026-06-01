'use client'

import Link from 'next/link'
import { useConfig } from '@/hooks/useConfig'
import { INTEGRATION_LABELS } from '@/lib/constants'

/** Shows active integrations as a read-only status with a link to manage them. */
export function IntegrationRow() {
  const { config } = useConfig()
  const active = [
    config.zapier?.webhookUrl ? INTEGRATION_LABELS.zapier : null,
    config.sheets?.spreadsheetId && config.sheets?.refreshToken ? INTEGRATION_LABELS.sheets : null,
  ].filter(Boolean)

  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Integrations</p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {active.length > 0 ? active.join(', ') : 'None'}
        </span>
        <Link
          href="/settings/connect"
          className="text-sm font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          Manage
        </Link>
      </div>
    </div>
  )
}
