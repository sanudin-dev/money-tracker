import type { Expense } from '@/types'

function escape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function exportToCsv(expenses: Expense[]): void {
  const headers = ['ID', 'Amount', 'Category', 'Description', 'Date', 'Created At']
  const rows = expenses.map((e) =>
    [e.id, String(e.amount), e.category, e.description, e.date, e.createdAt]
      .map(escape)
      .join(',')
  )

  const csv = [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
