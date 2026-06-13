'use client'

import { useState, useMemo, useEffect } from 'react'
import { useConfig } from '@/hooks/useConfig'
import { expenseSchema } from '@/lib/schema'
import { updateExpense } from '@/lib/storage'
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
import { XIcon } from 'lucide-react'

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
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Edit Expense
            </h2>
            {(config.webhook || config.sheets) && (
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
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
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
          />

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
