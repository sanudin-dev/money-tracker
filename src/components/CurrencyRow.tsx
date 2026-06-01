'use client'

import { useConfig } from '@/hooks/useConfig'
import { CURRENCIES, detectDefaultCurrency } from '@/lib/currency'

export function CurrencyRow() {
  const { config, update } = useConfig()
  const value = config.currencyCode ?? detectDefaultCurrency()

  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Currency</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => update({ currencyCode: e.target.value })}
          className="appearance-none rounded-lg border border-zinc-200 bg-transparent py-1 pl-2 pr-7 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 text-zinc-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </div>
  )
}
