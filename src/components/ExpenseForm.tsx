'use client'

import { useState, useMemo, useEffect } from 'react'
import { API } from '@/lib/constants'
import { useConfig } from '@/hooks/useConfig'
import { expenseSchema } from '@/lib/schema'
import { addExpense, getExpenses } from '@/lib/storage'
import { enqueueSync } from '@/lib/syncQueue'
import { SyncBanner } from '@/components/SyncBanner'
import {
  formatCurrency,
  getCurrencyFractionDigits,
  getCurrencySymbol,
  detectDefaultCurrency,
} from '@/lib/currency'
import { evaluateAmount } from '@/lib/math'
import { CATEGORIES } from '@/lib/categories'
import type { Expense } from '@/types'

function todayDate() {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local timezone
}

type FieldErrors = Partial<Record<'amount' | 'category' | 'date', string>>
type Status = { type: 'success' | 'error' | 'pending'; message: React.ReactNode } | null

type PushOutcome = { ok: boolean; offline?: boolean; error?: string }

export function ExpenseForm() {
  const { config } = useConfig()

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(todayDate)
  const [description, setDescription] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>(null)
  const [submitting, setSubmitting] = useState(false)

  // Auto-dismiss success/pending after 4 s so the message doesn't linger into the next entry.
  useEffect(() => {
    if (!status || status.type === 'error') return
    const t = setTimeout(() => setStatus(null), 4000)
    return () => clearTimeout(t)
  }, [status])

  const [pastDescriptions, setPastDescriptions] = useState<string[]>([])
  useEffect(() => {
    getExpenses().then((all) => {
      setPastDescriptions([...new Set(all.map((e) => e.description).filter(Boolean))])
    })
  }, [])

  const currencyCode = config.currencyCode ?? detectDefaultCurrency()
  const fractionDigits = useMemo(() => getCurrencyFractionDigits(currencyCode), [currencyCode])
  const currencySymbol = useMemo(() => getCurrencySymbol(currencyCode), [currencyCode])
  const amountPlaceholder = fractionDigits === 0 ? '0 or 50000 + 25000' : '0.00 or 12 + 8.50'

  const amountPreview = useMemo(() => {
    const val = evaluateAmount(amount)
    if (val === null) return null
    const hasOperator = /[+\-]/.test(amount)
    if (!hasOperator && val < 1000) return null
    return formatCurrency(val, currencyCode)
  }, [amount, currencyCode])

  function resetForm() {
    setAmount('')
    setCategory('')
    setDate(todayDate())
    setDescription('')
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setFieldErrors({})
    setStatus(null)

    const parsed = expenseSchema.safeParse({
      amount: evaluateAmount(amount) ?? NaN,
      category,
      description,
      date,
    })

    if (!parsed.success) {
      const errs: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors
        if (field) errs[field] = issue.message
      }
      setFieldErrors(errs)
      return
    }

    const id =
      crypto.randomUUID?.() ??
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })

    const expense: Expense = {
      ...parsed.data,
      id,
      createdAt: new Date().toISOString(),
    }

    // IndexedDB write happens before any API call. If the network request fails,
    // the expense is never lost — it's already on the device.
    addExpense(expense)

    const pushWebhook = async (): Promise<PushOutcome> => {
      if (!config.webhook?.webhookUrl) return { ok: true }
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
        const json = (await res.json()) as { ok: boolean; error?: string }
        if (!json.ok) return { ok: false, error: json.error ?? 'Webhook sync failed.' }
        return { ok: true }
      } catch {
        if (!navigator.onLine) {
          enqueueSync(expense.id, 'webhook')
          return { ok: false, offline: true }
        }
        return { ok: false, error: 'Could not reach webhook.' }
      }
    }

    const pushSheets = async (): Promise<PushOutcome> => {
      if (!config.sheets?.spreadsheetId || !config.sheets?.refreshToken) return { ok: true }
      try {
        const res = await fetch(API.SHEETS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...expense,
            sheetsSpreadsheetId: config.sheets.spreadsheetId,
            sheetsRefreshToken: config.sheets.refreshToken,
          }),
        })
        const json = (await res.json()) as { ok: boolean; error?: string }
        if (!json.ok) return { ok: false, error: json.error ?? 'Sheets API sync failed.' }
        return { ok: true }
      } catch {
        if (!navigator.onLine) {
          enqueueSync(expense.id, 'sheets')
          return { ok: false, offline: true }
        }
        return { ok: false, error: 'Could not reach Sheets API.' }
      }
    }

    const hasIntegrations =
      !!config.webhook?.webhookUrl ||
      (!!config.sheets?.spreadsheetId && !!config.sheets?.refreshToken)

    if (!hasIntegrations) {
      setStatus({ type: 'success', message: 'Expense saved!' })
      resetForm()
      return
    }

    setSubmitting(true)
    const [webhookResult, sheetsResult] = await Promise.all([pushWebhook(), pushSheets()])
    setSubmitting(false)

    const allOk = webhookResult.ok && sheetsResult.ok
    const anyOffline = webhookResult.offline || sheetsResult.offline
    const apiErrors = [webhookResult, sheetsResult]
      .filter((r): r is PushOutcome & { error: string } => !r.ok && !r.offline && !!r.error)
      .map((r) => r.error)
      .join('; ')

    if (allOk) {
      setStatus({ type: 'success', message: 'Expense saved!' })
    } else if (anyOffline && !apiErrors) {
      setStatus({ type: 'pending', message: 'Saved offline — will sync when back online.' })
    } else {
      setStatus({
        type: 'error',
        message: `Expense saved locally. Sync failed: ${apiErrors || 'Connection error.'}`,
      })
    }

    resetForm()
  }

  return (
    <>
      <SyncBanner />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Amount
          </label>
          <div className="flex overflow-hidden rounded-lg border border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-500 dark:border-zinc-700">
            <span className="flex items-center border-r border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
              {currencySymbol}
            </span>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder={amountPlaceholder}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-white px-3 py-2 text-sm focus:outline-none dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex gap-1.5">
            {fractionDigits === 0 &&
              ['00', '000', '0000'].map((zeros) => (
                <button
                  key={zeros}
                  type="button"
                  onClick={() => setAmount((prev) => (prev || '') + zeros)}
                  className="rounded-md border border-zinc-200 px-3.5 py-1 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
                >
                  +{zeros}
                </button>
              ))}
            <div className="flex-1" />
            {['+', '-'].map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setAmount((prev) => (prev || '') + op)}
                className="rounded-md border border-zinc-200 px-3.5 py-1 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
              >
                {op}
              </button>
            ))}
          </div>
          {amountPreview && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">= {amountPreview}</p>
          )}
          {fieldErrors.amount && <p className="text-xs text-red-500">{fieldErrors.amount}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="category"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Category
          </label>
          <div className="relative">
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 text-zinc-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          {fieldErrors.category && <p className="text-xs text-red-500">{fieldErrors.category}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            max={todayDate()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          {fieldErrors.date && <p className="text-xs text-red-500">{fieldErrors.date}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Description <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            id="description"
            type="text"
            list="description-suggestions"
            placeholder="e.g. lunch, fruits, coffee"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          {pastDescriptions.length > 0 && (
            <datalist id="description-suggestions">
              {pastDescriptions.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          )}
        </div>

        {status && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              status.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : status.type === 'pending'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {submitting ? 'Saving…' : 'Add Expense'}
        </button>
      </form>
    </>
  )
}
