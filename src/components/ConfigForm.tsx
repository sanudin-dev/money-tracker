'use client'

import { useState, useEffect } from 'react'
import { useConfig } from '@/hooks/useConfig'
import { API } from '@/lib/constants'
import { getConfig, getExpenses } from '@/lib/storage'
import { clearSyncQueue } from '@/lib/syncQueue'
import { CircleCheckBigIcon } from 'lucide-react'

function NotionIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-.777 6.807-6.990 7.193L24.970 99.967c-4.857.387-7.193-.193-9.72-3.300L4.410 83.023C1.690 79.337 .723 76.613.723 73.30V11.203C.723 7.510 1.500 4.700 6.017 4.313z"
        fill="#fff"
      />
      <path
        d="M61.350.227L6.017 4.313C1.500 4.700.723 7.510.723 11.203V73.30c0 3.313.967 6.037 3.687 9.723l10.840 13.644c2.527 3.107 4.863 3.687 9.720 3.300l63.753-3.883c6.213-.387 6.990-2.917 6.990-7.193V17.640c0-2.14-.78-2.780-3.31-4.543L74.167 3.143C69.893.037 68.147-.357 61.350.227zM25.833 19.443c-5.893.403-7.233.490-10.570-2.200L9.030 12.533c-.873-.777-.487-1.750 1.166-1.943l53.383-3.880c4.473-.387 6.797 1.167 8.543 2.527l9.123 6.617c.390.193 1.360 1.360 0 1.360l-55.027 3.300-.387-.07zM19.870 85.513V30.750c0-2.527.777-3.700 3.107-3.883l60.443-3.497c2.140-.193 3.107 1.167 3.107 3.690v54.18c0 2.527-.390 4.660-3.883 4.853l-57.723 3.300c-3.497.193-5.050-1.167-5.050-3.880zm56.990-52.607c.387 1.750 0 3.500-1.750 3.693l-2.913.577v42.773c-2.527 1.360-4.860 2.140-6.803 2.140-3.107 0-3.883-.973-6.21-3.883l-19.03-29.94v28.967l6.020 1.360s0 3.500-4.860 3.500l-13.400.777c-.390-.777 0-2.720 1.360-3.107l3.497-1.167V39.633l-4.860-.390c-.387-1.750.583-4.277 3.303-4.470l14.367-.973 19.807 30.323v-26.83l-5.050-.583c-.387-2.140 1.167-3.700 3.107-3.883l13.400-.777z"
        fill="#000"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

type WebhookErrors = Partial<Record<'webhookUrl', string>>
type SheetsErrors = Partial<Record<'spreadsheetId' | 'connection', string>>
type NotionErrors = Partial<Record<'databaseId' | 'notionToken' | 'connection', string>>

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

  // Notion draft
  const [notionOverrides, setNotionOverrides] = useState<
    Partial<{ databaseId: string; notionToken: string }>
  >({})
  const [notionErrors, setNotionErrors] = useState<NotionErrors>({})
  const [notionConnecting, setNotionConnecting] = useState(false)

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
  const notionDatabaseId = notionOverrides.databaseId ?? config.notion?.databaseId ?? ''
  const notionTokenDraft = notionOverrides.notionToken ?? ''

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

  function handleDisconnectNotion() {
    update({ notion: undefined })
    clearSyncQueue('notion')
    setNotionOverrides({})
    setNotionErrors({})
  }

  async function handleSaveNotion(e: { preventDefault(): void }) {
    e.preventDefault()
    setNotionErrors({})

    if (!notionDatabaseId) {
      setNotionErrors({ databaseId: 'Database ID is required.' })
      return
    }
    if (!notionTokenDraft) {
      setNotionErrors({ notionToken: 'Integration token is required.' })
      return
    }

    setNotionConnecting(true)
    try {
      const res = await fetch(API.NOTION_CONNECT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseId: notionDatabaseId, notionToken: notionTokenDraft }),
      })
      const json = (await res.json()) as { ok: boolean; encryptedToken?: string; error?: string }
      if (!json.ok || !json.encryptedToken) {
        setNotionErrors({ connection: json.error ?? 'Could not connect to Notion.' })
        return
      }
      update({ notion: { databaseId: notionDatabaseId, encryptedToken: json.encryptedToken } })
      setNotionOverrides({})
    } catch {
      setNotionErrors({ connection: 'Could not reach the server.' })
    } finally {
      setNotionConnecting(false)
    }
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
                <CircleCheckBigIcon className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
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

      <div className="border-t border-zinc-200 dark:border-zinc-800" />

      {/* ── Notion ── */}
      <form onSubmit={handleSaveNotion} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <NotionIcon />
            Notion
          </h2>
          {config.notion && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Active
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="notionDatabaseId"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Database ID
          </label>
          <input
            id="notionDatabaseId"
            type="text"
            placeholder="8a3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d"
            value={notionDatabaseId}
            onChange={(e) => {
              setNotionOverrides((o) => ({ ...o, databaseId: e.target.value }))
              setNotionErrors({})
            }}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Found in the database URL: notion.so/…/
            <strong className="text-zinc-600 dark:text-zinc-300">DATABASE_ID</strong>?v=…
          </p>
          {notionErrors.databaseId && (
            <p className="text-xs text-red-500">{notionErrors.databaseId}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="notionToken"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Integration Token
          </label>
          <input
            id="notionToken"
            type="password"
            placeholder="secret_…"
            value={notionTokenDraft}
            onChange={(e) => {
              setNotionOverrides((o) => ({ ...o, notionToken: e.target.value }))
              setNotionErrors({})
            }}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Create an internal integration at{' '}
            <strong className="text-zinc-600 dark:text-zinc-300">notion.so/my-integrations</strong>{' '}
            and share the database with it.
          </p>
          {notionErrors.notionToken && (
            <p className="text-xs text-red-500">{notionErrors.notionToken}</p>
          )}
        </div>

        {config.notion && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-800/40 dark:bg-green-900/20">
            <CircleCheckBigIcon className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-300">Notion connected</span>
          </div>
        )}

        {notionErrors.connection && (
          <p className="text-xs text-red-500">{notionErrors.connection}</p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={notionConnecting}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {notionConnecting ? 'Connecting…' : 'Save'}
          </button>
          {config.notion && (
            <button
              type="button"
              onClick={handleDisconnectNotion}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Disconnect
            </button>
          )}
        </div>

        {config.notion && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Use the{' '}
              <strong className="text-zinc-700 dark:text-zinc-300">Sync now</strong> button to sync
              expenses with your Notion database — it checks for duplicates automatically.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
