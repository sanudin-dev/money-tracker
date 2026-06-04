'use client'

import { useState, useMemo, useEffect } from 'react'
import { useConfig } from '@/hooks/useConfig'
import { expenseSchema } from '@/lib/schema'
import { updateExpense } from '@/lib/storage'
import { formatCurrency, getCurrencyFractionDigits, getCurrencySymbol, detectDefaultCurrency } from '@/lib/currency'
import { evaluateAmount } from '@/lib/math'
import { CATEGORIES } from '@/lib/categories'
import type { Expense } from '@/types'

type FieldErrors = Partial<Record<'amount' | 'category' | 'date', string>>

type Props = {
  expense: Expense
  onSave: (updated: Expense) => void
  onClose: () => void
}

export function EditExpenseModal({ expense, onSave, onClose }: Props) {
  const { config } = useConfig()
  const currencyCode = config.currencyCode ?? detectDefaultCurrency()
  const fractionDigits = useMemo(() => getCurrencyFractionDigits(currencyCode), [currencyCode])
  const currencySymbol = useMemo(() => getCurrencySymbol(currencyCode), [currencyCode])

  const [amount, setAmount] = useState(String(expense.amount))
  const [category, setCategory] = useState(expense.category)
  const [date, setDate] = useState(expense.date)
  const [description, setDescription] = useState(expense.description)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)

  const amountPreview = useMemo(() => {
    const val = evaluateAmount(amount)
    if (val === null) return null
    const hasOperator = /[+\-]/.test(amount)
    if (!hasOperator && val < 1000) return null
    return formatCurrency(val, currencyCode)
  }, [amount, currencyCode])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault()
    setFieldErrors({})

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

    setSaving(true)
    await updateExpense(expense.id, parsed.data)
    const updated: Expense = { ...expense, ...parsed.data }
    onSave(updated)
  }

  const amountPlaceholder = fractionDigits === 0 ? '0 or 50000 + 25000' : '0.00 or 12 + 8.50'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-zinc-900 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Edit Expense</h2>
            {(config.zapier || config.sheets) && (
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                Saved to your device only — connected integrations won&apos;t be updated.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount</label>
            <div className="flex overflow-hidden rounded-lg border border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-500 dark:border-zinc-700">
              <span className="flex items-center border-r border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                {currencySymbol}
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder={amountPlaceholder}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-white px-3 py-2 text-sm focus:outline-none dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            {fractionDigits === 0 && (
              <div className="flex gap-1.5">
                {['00', '000', '0000'].map((zeros) => (
                  <button
                    key={zeros}
                    type="button"
                    onClick={() => setAmount((prev) => (prev || '') + zeros)}
                    className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
                  >
                    +{zeros}
                  </button>
                ))}
              </div>
            )}
            {amountPreview && <p className="text-xs text-zinc-400 dark:text-zinc-500">= {amountPreview}</p>}
            {fieldErrors.amount && <p className="text-xs text-red-500">{fieldErrors.amount}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-lg border border-zinc-300 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-zinc-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
            {fieldErrors.category && <p className="text-xs text-red-500">{fieldErrors.category}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date</label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            {fieldErrors.date && <p className="text-xs text-red-500">{fieldErrors.date}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. lunch, fruits, coffee"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
