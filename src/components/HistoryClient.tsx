'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useConfig } from '@/hooks/useConfig'
import { formatCurrency, detectDefaultCurrency } from '@/lib/currency'
import { getExpenses, deleteExpense } from '@/lib/storage'
import { EditExpenseModal } from '@/components/EditExpenseModal'
import { SyncBanner } from '@/components/SyncBanner'
import { exportToCsv } from '@/lib/export'
import { CATEGORIES } from '@/lib/categories'
import type { Expense } from '@/types'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisIcon, PencilIcon, Trash2Icon } from 'lucide-react'

type MonthState = { year: number; month: number }

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function formatDayHeader(dateStr: string): string {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  if (dateStr === todayStr) return 'Today'
  if (dateStr === yesterdayStr) return 'Yesterday'

  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function currentMonthState(): MonthState {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function prevMonth(m: MonthState): MonthState {
  return m.month === 1 ? { year: m.year - 1, month: 12 } : { year: m.year, month: m.month - 1 }
}

function nextMonth(m: MonthState): MonthState {
  return m.month === 12 ? { year: m.year + 1, month: 1 } : { year: m.year, month: m.month + 1 }
}

function isCurrentMonth(m: MonthState): boolean {
  const now = new Date()
  return m.year === now.getFullYear() && m.month === now.getMonth() + 1
}

export function HistoryClient() {
  const { config } = useConfig()
  const currencyCode = config.currencyCode ?? detectDefaultCurrency()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<MonthState>(currentMonthState)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    getExpenses().then((data) => {
      setExpenses(data)
      setLoading(false)
    })
  }, [])

  // Reload local list when SyncBanner pulls new expenses from Sheets.
  useEffect(() => {
    const handler = () => void getExpenses().then(setExpenses)
    window.addEventListener('mt:sheets-pull', handler)
    return () => window.removeEventListener('mt:sheets-pull', handler)
  }, [])

  function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    deleteExpense(id).catch(() => getExpenses().then(setExpenses))
  }

  const monthPrefix = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}`
  const filtered = expenses.filter((e) => e.date.startsWith(monthPrefix))
  const monthTotal = filtered.reduce((sum, e) => sum + e.amount, 0)

  const categoryTotals = Object.entries(
    filtered.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount
      return acc
    }, {})
  ).sort(([, a], [, b]) => b - a)

  const groups = Object.entries(
    filtered.reduce<Record<string, Expense[]>>((acc, e) => {
      if (!acc[e.date]) acc[e.date] = []
      acc[e.date].push(e)
      return acc
    }, {})
  ).sort(([a], [b]) => b.localeCompare(a))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-zinc-400 dark:text-zinc-500">Loading…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {menuOpenId && <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={(updated) => {
            setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
            setEditingExpense(null)
          }}
          onClose={() => setEditingExpense(null)}
        />
      )}

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Delete expense?
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              This removes it from your local history only. If Google Sheets is connected, the row
              stays in your spreadsheet — syncing will bring it back.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(confirmDeleteId)
                  setConfirmDeleteId(null)
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <SyncBanner />

      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedMonth(prevMonth)}
          aria-label="Previous month"
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {formatMonthLabel(selectedMonth.year, selectedMonth.month)}
        </span>
        <button
          type="button"
          onClick={() => setSelectedMonth(nextMonth)}
          disabled={isCurrentMonth(selectedMonth)}
          aria-label="Next month"
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Month summary + category accordion + CSV export */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCategoryOpen((o) => !o)}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <span>
                {filtered.length} expense{filtered.length !== 1 ? 's' : ''} ·{' '}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(monthTotal, currencyCode)}
                </span>
              </span>
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() =>
                exportToCsv(
                  filtered,
                  `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}`
                )
              }
              className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Export CSV
            </button>
          </div>
          {categoryOpen && (
            <div className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
              {categoryTotals.map(([cat, total], i) => (
                <div
                  key={cat}
                  className={`flex items-center justify-between px-3 py-2 ${i < categoryTotals.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const meta = CATEGORIES.find((c) => c.label === cat)
                      return <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta?.iconBg ?? 'bg-zinc-300 dark:bg-zinc-600'}`} />
                    })()}
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{cat}</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(total, currencyCode)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No expenses in {formatMonthLabel(selectedMonth.year, selectedMonth.month)}.
          </p>
          {isCurrentMonth(selectedMonth) && (
            <Link
              href="/add"
              className="mt-2 inline-block text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
            >
              Add your first expense
            </Link>
          )}
        </div>
      )}

      {/* Grouped by date */}
      <div className="flex flex-col gap-5">
        {groups.map(([date, dayExpenses]) => {
          const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
          return (
            <div key={date} className="flex flex-col gap-2 pb-5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  {formatDayHeader(date)}
                </span>
                <span className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatCurrency(dayTotal, currencyCode)}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {dayExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const meta = CATEGORIES.find((c) => c.label === expense.category)
                        return meta ? (
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${meta.iconBg}`}>
                            <meta.icon className="h-5 w-5" />
                          </div>
                        ) : null
                      })()}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {expense.category}
                        </span>
                        {expense.description && (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            {expense.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(expense.amount, currencyCode)}
                      </span>
                      <div className="relative">
                        <button
                          type="button"
                          aria-label="More options"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuOpenId((id) => (id === expense.id ? null : expense.id))
                          }}
                          className="rounded-md p-1 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                        >
                          <EllipsisIcon className="h-4 w-4" />
                        </button>
                        {menuOpenId === expense.id && (
                          <div className="absolute right-0 bottom-full mb-1 z-20 min-w-[110px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingExpense(expense)
                                setMenuOpenId(null)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-700"
                            >
                              <PencilIcon className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteId(expense.id)
                                setMenuOpenId(null)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                            >
                              <Trash2Icon className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
