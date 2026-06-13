'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { API } from '@/lib/constants'
import { useConfig } from '@/hooks/useConfig'
import { expenseSchema } from '@/lib/schema'
import { addExpense, getExpenses } from '@/lib/storage'
import { enqueueSync } from '@/lib/syncQueue'
import {
  formatCurrency,
  getCurrencyFractionDigits,
  getCurrencySymbol,
  detectDefaultCurrency,
} from '@/lib/currency'
import { evaluateAmount } from '@/lib/math'
import { ExpenseFields } from '@/components/ExpenseFields'
import type { FieldErrors } from '@/components/ExpenseFields'
import type { Expense } from '@/types'

function todayDate() {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local timezone
}

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

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const currencyCode = mounted ? (config.currencyCode ?? detectDefaultCurrency()) : ''
  const fractionDigits = useMemo(() => getCurrencyFractionDigits(currencyCode), [currencyCode])
  const currencySymbol = useMemo(() => (currencyCode ? getCurrencySymbol(currencyCode) : ''), [currencyCode])
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
        if (!json.ok) {
          if (res.status !== 401) enqueueSync(expense.id, 'webhook')
          return { ok: false, error: json.error ?? 'Webhook sync failed.' }
        }
        return { ok: true }
      } catch {
        enqueueSync(expense.id, 'webhook')
        if (!navigator.onLine) return { ok: false, offline: true }
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
        if (!json.ok) {
          if (res.status !== 401) enqueueSync(expense.id, 'sheets')
          return { ok: false, error: json.error ?? 'Sheets API sync failed.' }
        }
        return { ok: true }
      } catch {
        enqueueSync(expense.id, 'sheets')
        if (!navigator.onLine) return { ok: false, offline: true }
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <ExpenseFields
        amount={amount}
        setAmount={setAmount}
        category={category}
        setCategory={setCategory}
        date={date}
        setDate={setDate}
        description={description}
        setDescription={setDescription}
        fieldErrors={fieldErrors}
        currencySymbol={currencySymbol}
        fractionDigits={fractionDigits}
        amountPlaceholder={amountPlaceholder}
        amountPreview={amountPreview}
        pastDescriptions={pastDescriptions}
      />

      {status && (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : status.type === 'pending'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {status.message}
          {typeof status.message === 'string' && /reconnect/i.test(status.message) && (
            <Link href="/settings/connect" className="ml-1 font-medium underline underline-offset-2">
              Go to Connect →
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {submitting ? 'Saving…' : 'Add Expense'}
      </button>
    </form>
  )
}
