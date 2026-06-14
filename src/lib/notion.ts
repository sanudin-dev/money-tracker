import type { Expense } from '@/types'

const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

type NotionError = { object: 'error'; message: string; code: string }

type NotionPage = {
  properties: {
    ID?: { title: { plain_text: string }[] }
    Amount?: { number: number | null }
    Category?: { select: { name: string } | null }
    Description?: { rich_text: { plain_text: string }[] }
    Date?: { date: { start: string } | null }
    'Created At'?: { rich_text: { plain_text: string }[] }
  }
}

function isNotionError(data: unknown): data is NotionError {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as NotionError).object === 'error' &&
    typeof (data as NotionError).message === 'string'
  )
}

function notionHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  }
}

/**
 * Validates that the integration token can access the given database.
 * Returns the database title on success; throws a descriptive error on failure.
 */
export async function validateDatabase(databaseId: string, token: string): Promise<string> {
  const res = await fetch(`${NOTION_API}/databases/${databaseId}`, {
    headers: notionHeaders(token),
  })
  const data: unknown = await res.json()
  if (!res.ok) {
    if (isNotionError(data)) {
      if (data.code === 'object_not_found') throw new Error('Database not found — check the ID and ensure the integration has access.')
      if (data.code === 'unauthorized') throw new Error('Invalid integration token.')
      throw new Error(data.message)
    }
    throw new Error(`Notion API error ${res.status}`)
  }
  const body = data as { title?: { plain_text?: string }[] }
  return body.title?.[0]?.plain_text ?? 'Untitled'
}

function pageToExpense(page: NotionPage): Expense | null {
  const id = page.properties.ID?.title[0]?.plain_text
  const amount = page.properties.Amount?.number
  const category = page.properties.Category?.select?.name
  const description = page.properties.Description?.rich_text[0]?.plain_text ?? ''
  const date = page.properties.Date?.date?.start
  const createdAt = page.properties['Created At']?.rich_text[0]?.plain_text
  if (!id || amount == null || isNaN(amount) || !category || !date || !createdAt) return null
  return { id, amount, category, description, date, createdAt }
}

/**
 * Reads all expenses from the Notion database, paginating through all results.
 * Used by the bidirectional sync (useNotionSync) to pull pages missing from IndexedDB.
 */
export async function fetchExpenses(databaseId: string, token: string): Promise<Expense[]> {
  const expenses: Expense[] = []
  let cursor: string | undefined

  do {
    const body: Record<string, unknown> = { page_size: 100 }
    if (cursor) body.start_cursor = cursor

    const res = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
      method: 'POST',
      headers: notionHeaders(token),
      body: JSON.stringify(body),
    })
    const data: unknown = await res.json()
    if (!res.ok) {
      const message = isNotionError(data) ? data.message : `Notion API error ${res.status}`
      throw new Error(message)
    }

    const page = data as { results: NotionPage[]; has_more: boolean; next_cursor: string | null }
    for (const p of page.results) {
      const expense = pageToExpense(p)
      if (expense) expenses.push(expense)
    }
    cursor = page.has_more && page.next_cursor ? page.next_cursor : undefined
  } while (cursor)

  return expenses
}

/**
 * Creates a new page (row) in the Notion database for the given expense.
 * Requires the database to have these properties: ID (title), Amount (number),
 * Category (select), Description (rich text), Date (date), Created At (rich text).
 */
export async function appendExpense(databaseId: string, token: string, expense: Expense): Promise<void> {
  const res = await fetch(`${NOTION_API}/pages`, {
    method: 'POST',
    headers: notionHeaders(token),
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        ID: { title: [{ text: { content: expense.id } }] },
        Amount: { number: expense.amount },
        Category: { select: { name: expense.category } },
        Description: { rich_text: [{ text: { content: expense.description } }] },
        Date: { date: { start: expense.date } },
        'Created At': { rich_text: [{ text: { content: expense.createdAt } }] },
      },
    }),
  })

  const data: unknown = await res.json()
  if (!res.ok) {
    const message = isNotionError(data) ? data.message : `Notion API error ${res.status}`
    throw new Error(message)
  }
}
