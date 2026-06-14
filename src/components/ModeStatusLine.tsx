'use client'

import Link from 'next/link'
import { useConfig } from '@/hooks/useConfig'
import { INTEGRATION_META } from '@/components/icons'
import type { IntegrationType } from '@/types'

/** Renders a compact line showing which integrations are active, with a link to manage them. */
export function IntegrationStatusLine() {
  const { config } = useConfig()

  const active = [
    config.webhook?.webhookUrl ? 'webhook' : null,
    config.sheets?.spreadsheetId && config.sheets?.refreshToken ? 'sheets' : null,
    config.notion?.databaseId && config.notion?.encryptedToken ? 'notion' : null,
  ].filter(Boolean) as IntegrationType[]

  return (
    <div className="mb-5 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
      <span className="font-medium text-zinc-600 dark:text-zinc-400">
        {active.length > 0 ? 'Active integrations:' : 'Local only'}
      </span>
      {active.length > 0 && (
        <span className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100">
          {active.map((type) => {
            const { label, Icon } = INTEGRATION_META[type]
            return (
              <span key={type} title={label}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            )
          })}
        </span>
      )}
      <span>·</span>
      <Link
        href="/settings/connect"
        className="underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        {active.length > 0 ? 'Manage' : 'Manage integrations'}
      </Link>
    </div>
  )
}
