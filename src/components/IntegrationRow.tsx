'use client'

import Link from 'next/link'
import { useConfig } from '@/hooks/useConfig'
import { INTEGRATION_META } from '@/components/icons'
import type { IntegrationType } from '@/types'

/** Shows active integrations as a read-only status with a link to manage them. */
export function IntegrationRow() {
  const { config } = useConfig()

  const active = [
    config.webhook?.webhookUrl ? 'webhook' : null,
    config.sheets?.spreadsheetId && config.sheets?.refreshToken ? 'sheets' : null,
    config.notion?.databaseId && config.notion?.encryptedToken ? 'notion' : null,
  ].filter(Boolean) as IntegrationType[]

  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Integrations</p>
      <div className="flex items-center gap-2">
        {active.length > 0 ? (
          <span className="flex items-center gap-1.5">
            {active.map((type) => {
              const { label, Icon } = INTEGRATION_META[type]
              return (
                <span key={type} title={label}>
                  <Icon className="h-4 w-4"/>
                </span>
              )
            })}
          </span>
        ) : (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">None</span>
        )}
        <span>·</span>
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
