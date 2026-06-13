'use client'

import type { Dispatch, SetStateAction } from 'react'
import { ChevronDownIcon, Grid2X2Icon } from 'lucide-react'
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories'

export type FieldErrors = Partial<Record<'amount' | 'category' | 'date', string>>

type Props = {
  amount: string
  setAmount: Dispatch<SetStateAction<string>>
  category: string
  setCategory: (v: string) => void
  date: string
  setDate: (v: string) => void
  description: string
  setDescription: (v: string) => void
  fieldErrors: FieldErrors
  currencySymbol: string
  fractionDigits: number
  amountPlaceholder: string
  amountPreview: string | null
  pastDescriptions?: string[]
}

/** Shared form fields (Amount, Category, Date, Description) used by ExpenseForm and EditExpenseModal. */
export function ExpenseFields({
  amount,
  setAmount,
  category,
  setCategory,
  date,
  setDate,
  description,
  setDescription,
  fieldErrors,
  currencySymbol,
  fractionDigits,
  amountPlaceholder,
  amountPreview,
  pastDescriptions,
}: Props) {
  return (
    <>
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
        <label htmlFor="category" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Category
        </label>
        <div className="flex overflow-hidden rounded-lg border border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-500 dark:border-zinc-700">
          <span className="flex items-center border-r border-zinc-300 bg-zinc-50 px-2.5 dark:border-zinc-700 dark:bg-zinc-800">
            {(() => {
              const meta = CATEGORIES.find((c) => c.label === category)
              return meta ? (
                <span className={`flex h-6 w-6 items-center justify-center rounded-md text-white ${meta.iconBg}`}>
                  <meta.icon className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-200 dark:bg-zinc-700">
                  <Grid2X2Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                </span>
              )
            })()}
          </span>
          <div className="relative flex-1">
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-white px-3 py-2 pr-8 text-sm focus:outline-none dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Select category</option>
              {CATEGORY_LABELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
              <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
            </div>
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
          max={new Date().toLocaleDateString('en-CA')}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        {fieldErrors.date && <p className="text-xs text-red-500">{fieldErrors.date}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          id="description"
          type="text"
          list={pastDescriptions?.length ? 'description-suggestions' : undefined}
          placeholder="e.g. lunch, fruits, coffee"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        {pastDescriptions && pastDescriptions.length > 0 && (
          <datalist id="description-suggestions">
            {pastDescriptions.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        )}
      </div>
    </>
  )
}
