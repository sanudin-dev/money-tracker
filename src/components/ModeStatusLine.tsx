'use client'

import Link from 'next/link'
import { useConfig } from '@/hooks/useConfig'
import { INTEGRATION_LABELS } from '@/lib/constants'

/** Renders a compact line showing which integrations are active, with a link to manage them. */
export function IntegrationStatusLine() {
  const { config } = useConfig()
  const active = [
    config.webhook?.webhookUrl ? INTEGRATION_LABELS.webhook : null,
    config.sheets?.spreadsheetId && config.sheets?.refreshToken ? INTEGRATION_LABELS.sheets : null,
  ].filter(Boolean)

  const label = active.length > 0 ? active.join(' + ') + ' active' : 'Local only'

  return (
    <p className="mb-5 text-xs text-zinc-400 dark:text-zinc-500">
      <span className="font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      {' · '}
      <Link
        href="/settings/connect"
        className="underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        Manage integrations
      </Link>
    </p>
  )
}
