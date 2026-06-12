'use client'

import { useState, useEffect } from 'react'
import { useConfig } from '@/hooks/useConfig'
import { API } from '@/lib/constants'
import { getConfig, getExpenses } from '@/lib/storage'
import { clearSyncQueue } from '@/lib/syncQueue'

type WebhookErrors = Partial<Record<'webhookUrl', string>>
type SheetsErrors = Partial<Record<'spreadsheetId' | 'connection', string>>

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function ConfigForm() {
  const { config, update } = useConfig()

  // Webhook draft — undefined means "use config value"
  const [webhookOverrides, setWebhookOverrides] = useState<
    Partial<{ webhookUrl: string; appId: string }>
  >({})
  const [webhookErrors, setWebhookErrors] = useState<WebhookErrors>({})
  const [webhookSaved, setWebhookSaved] = useState(false)
  const [webhookSyncing, setWebhookSyncing] = useState(false)
  const [webhookSyncResult, setWebhookSyncResult] = useState<{
    done: number
    failed: number
  } | null>(null)

  // Sheets draft
  const [sheetsOverrides, setSheetsOverrides] = useState<Partial<{ spreadsheetId: string }>>({})
  const [sheetsErrors, setSheetsErrors] = useState<SheetsErrors>({})
  const [sheetsSaved, setSheetsSaved] = useState(false)
  const [authError, setAuthError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const err = new URLSearchParams(window.location.search).get('authError')
    if (!err) return null
    return err === 'cancelled'
      ? 'Google sign-in was cancelled.'
      : 'Google sign-in failed — check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.'
  })

  // Resolved display values (override takes priority, then config, then empty)
  const webhookUrl = webhookOverrides.webhookUrl ?? config.webhook?.webhookUrl ?? ''
  const webhookAppId = webhookOverrides.appId ?? config.webhook?.appId ?? ''
  const sheetsId = sheetsOverrides.spreadsheetId ?? config.sheets?.spreadsheetId ?? ''

  // Process OAuth callback URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('sheetsRefreshToken')
    const email = params.get('sheetsEmail')
    const err = params.get('authError')

    if (token) {
      const pendingSid = localStorage.getItem('mt_oauth_sid') ?? config.sheets?.spreadsheetId ?? ''
      localStorage.removeItem('mt_oauth_sid')
      // Spread getConfig() explicitly so webhook + currency are preserved even if
      // _config hasn't been initialized from localStorage yet during hydration.
      update({
        ...getConfig(),
        sheets: {
          spreadsheetId: pendingSid,
          refreshToken: token,
          connectedEmail: email ?? '',
        },
      })
      window.history.replaceState({}, '', window.location.pathname)
    }

    if (err) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleConnectGoogle() {
    if (sheetsId) localStorage.setItem('mt_oauth_sid', sheetsId)
    window.location.href = '/api/auth/google'
  }

  function handleDisconnectSheets() {
    update({ sheets: undefined })
    clearSyncQueue('sheets')
    setSheetsOverrides({})
    setSheetsSaved(false)
    setSheetsErrors({})
    setAuthError(null)
  }

  function handleDisconnectWebhook() {
    update({ webhook: undefined })
    clearSyncQueue('webhook')
    setWebhookOverrides({})
    setWebhookSaved(false)
    setWebhookErrors({})
  }

  function handleSaveWebhook(e: { preventDefault(): void }) {
    e.preventDefault()
    setWebhookErrors({})
    setWebhookSaved(false)

    if (!webhookUrl) {
      setWebhookErrors({ webhookUrl: 'Webhook URL is required.' })
      return
    }

    update({ webhook: { webhookUrl, ...(webhookAppId ? { appId: webhookAppId } : {}) } })
    setWebhookOverrides({})
    setWebhookSaved(true)
  }

  async function handleSyncAllWebhook() {
    if (!config.webhook || webhookSyncing) return
    setWebhookSyncing(true)
    setWebhookSyncResult(null)
    const expenses = await getExpenses()
    let done = 0,
      failed = 0
    for (const expense of expenses) {
      try {
        const res = await fetch(API.WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...expense,
            webhookUrl: config.webhook.webhookUrl,
            appId: config.webhook.appId,
          }),
        })
        const json = (await res.json()) as { ok: boolean }
        if (json.ok) done++
        else failed++
      } catch {
        failed++
      }
    }
    setWebhookSyncing(false)
    setWebhookSyncResult({ done, failed })
  }

  function handleSaveSheets(e: { preventDefault(): void }) {
    e.preventDefault()
    setSheetsErrors({})
    setSheetsSaved(false)

    if (!sheetsId) {
      setSheetsErrors({ spreadsheetId: 'Spreadsheet ID is required.' })
      return
    }
    if (!config.sheets?.refreshToken) {
      setSheetsErrors({ connection: 'Connect your Google account before saving.' })
      return
    }

    update({ sheets: { ...config.sheets, spreadsheetId: sheetsId } })
    setSheetsOverrides({})
    setSheetsSaved(true)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Webhook ── */}
      <form onSubmit={handleSaveWebhook} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Webhook</h2>
          {config.webhook && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Active
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="webhookUrl"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Webhook URL
          </label>
          <input
            id="webhookUrl"
            type="url"
            placeholder="https://hooks.zapier.com/hooks/catch/… or Make/Pipedream/n8n URL"
            value={webhookUrl}
            onChange={(e) => {
              setWebhookOverrides((o) => ({ ...o, webhookUrl: e.target.value }))
              setWebhookSaved(false)
            }}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          {webhookErrors.webhookUrl && (
            <p className="text-xs text-red-500">{webhookErrors.webhookUrl}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="webhookAppId"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            App ID <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            id="webhookAppId"
            type="text"
            placeholder="e.g. money-tracker"
            value={webhookAppId}
            onChange={(e) => {
              setWebhookOverrides((o) => ({ ...o, appId: e.target.value }))
              setWebhookSaved(false)
            }}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Included in every payload. Use it to filter by source app — e.g. a{' '}
            <strong className="text-zinc-500 dark:text-zinc-400">Filter</strong> step in Zapier or
            Make.
          </p>
        </div>

        {webhookSaved && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            Webhook settings saved.
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Save
          </button>
          {config.webhook && (
            <button
              type="button"
              onClick={handleDisconnectWebhook}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Disconnect
            </button>
          )}
        </div>

        {config.webhook && (
          <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <strong className="text-zinc-700 dark:text-zinc-300">Sync local data</strong> — push
              all expenses saved on this device to the webhook. May create duplicates if some were
              already synced.
            </p>
            <button
              type="button"
              onClick={handleSyncAllWebhook}
              disabled={webhookSyncing}
              className="self-start rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-white disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {webhookSyncing ? 'Syncing…' : 'Sync all expenses'}
            </button>
            {webhookSyncResult && (
              <p
                className={`text-xs ${webhookSyncResult.failed > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}
              >
                {webhookSyncResult.done} synced
                {webhookSyncResult.failed > 0 ? `, ${webhookSyncResult.failed} failed` : ''}
              </p>
            )}
          </div>
        )}
      </form>

      <div className="border-t border-zinc-200 dark:border-zinc-800" />

      {/* ── Sheets API ── */}
      <form onSubmit={handleSaveSheets} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sheets API</h2>
          {config.sheets && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Active
            </span>
          )}
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-900/20">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
            Testing mode — access required
          </p>
          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-500">
            This integration is currently limited to approved accounts.{' '}
            <a href="mailto:hello.sanudin@gmail.com" className="underline underline-offset-2">
              Contact me
            </a>{' '}
            to request access before connecting.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sheetsSpreadsheetId"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Spreadsheet ID
          </label>
          <input
            id="sheetsSpreadsheetId"
            type="text"
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            value={sheetsId}
            onChange={(e) => {
              setSheetsOverrides((o) => ({ ...o, spreadsheetId: e.target.value }))
              setSheetsSaved(false)
            }}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Found in the sheet URL: …/spreadsheets/d/
            <strong className="text-zinc-600 dark:text-zinc-300">YOUR_ID</strong>/edit
          </p>
          {sheetsErrors.spreadsheetId && (
            <p className="text-xs text-red-500">{sheetsErrors.spreadsheetId}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Google Account</p>
          {config.sheets?.refreshToken ? (
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-800/40 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-green-800 dark:text-green-300">
                  {config.sheets.connectedEmail
                    ? `Connected as ${config.sheets.connectedEmail}`
                    : 'Google account connected'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDisconnectSheets}
                className="ml-3 shrink-0 text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleConnectGoogle}
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                <GoogleIcon />
                Connect Google Sheets
              </button>
              {authError && <p className="text-xs text-red-500">{authError}</p>}
              {sheetsErrors.connection && (
                <p className="text-xs text-red-500">{sheetsErrors.connection}</p>
              )}
            </div>
          )}
        </div>

        {sheetsSaved && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            Sheets API settings saved.
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Save
          </button>
          {config.sheets && (
            <button
              type="button"
              onClick={handleDisconnectSheets}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Disconnect
            </button>
          )}
        </div>

        {config.sheets?.refreshToken && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Use the{' '}
              <strong className="text-zinc-700 dark:text-zinc-300">Sync now</strong> button to sync
              expenses with your sheet — it checks for duplicates automatically.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
