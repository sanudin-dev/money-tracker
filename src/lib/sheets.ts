import type { Expense } from '@/types'

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const MONTH_TAB_REGEX = /^\d{4}-\d{2}$/
const COLUMNS = ['id', 'amount', 'category', 'description', 'date', 'createdAt'] as const
// Header names match the column names Zapier uses so both integrations produce the same layout.
const HEADER_ROW = ['ID', 'Amount', 'Category', 'Description', 'Date', 'Created At (UTC)']

type SheetsError = { error: { code: number; message: string } }

function isSheetsError(data: unknown): data is SheetsError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as SheetsError).error?.message === 'string'
  )
}

/** Returns the YYYY-MM tab name for a given expense date string. */
function getTabName(date: string): string {
  return date.slice(0, 7)
}

/** Fetches all sheet tab titles from the spreadsheet metadata. */
async function fetchSheetNames(spreadsheetId: string, accessToken: string): Promise<string[]> {
  const url = `${SHEETS_BASE}/${spreadsheetId}?fields=sheets.properties.title`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  const data: unknown = await res.json()
  if (!res.ok) {
    const message = isSheetsError(data) ? data.error.message : `Sheets API error ${res.status}`
    throw new Error(message)
  }
  const body = data as { sheets?: { properties: { title: string } }[] }
  return (body.sheets ?? []).map((s) => s.properties.title)
}

/**
 * Creates a YYYY-MM tab and writes the header row.
 * If the tab already exists (created by another device or a concurrent request), returns silently.
 */
async function createMonthTab(
  spreadsheetId: string,
  accessToken: string,
  tabName: string
): Promise<void> {
  const batchRes = await fetch(`${SHEETS_BASE}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tabName } } }] }),
  })
  const batchData: unknown = await batchRes.json()

  if (!batchRes.ok) {
    // "already exists" covers: tab created by another user/device, or a concurrent request on the same device.
    if (
      isSheetsError(batchData) &&
      batchData.error.message.toLowerCase().includes('already exists')
    )
      return
    const message = isSheetsError(batchData)
      ? batchData.error.message
      : `Sheets API error ${batchRes.status}`
    throw new Error(message)
  }

  // New tab — write the header row before any data rows land.
  await fetch(
    `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(`${tabName}!A1:F1`)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ values: [HEADER_ROW] }),
    }
  )
}

/** Exchanges a refresh token for a short-lived access token. */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      grant_type: 'refresh_token',
    }),
  })

  const data = (await res.json()) as { access_token?: string; error?: string }
  if (!res.ok || !data.access_token) {
    if (data.error === 'invalid_grant') {
      throw new Error('Google Sheets token expired — please reconnect.')
    }
    const msg = data.error
      ? data.error.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
      : 'Failed to refresh Google access token.'
    throw new Error(msg)
  }
  return data.access_token
}

/**
 * Appends a single expense row to the YYYY-MM tab matching the expense date.
 * The tab is created (with headers) on first use; subsequent writes skip creation silently.
 */
export async function appendExpense(
  spreadsheetId: string,
  accessToken: string,
  expense: Expense
): Promise<void> {
  const tabName = getTabName(expense.date)
  await createMonthTab(spreadsheetId, accessToken, tabName)

  const range = encodeURIComponent(`${tabName}!A1`)
  // RAW keeps all cell values as plain text so date/time strings are stored exactly
  // as sent — consistent with what Zapier writes when it receives the same JSON payload.
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`

  const row = COLUMNS.map((col) =>
    col === 'createdAt' ? expense.createdAt.slice(0, 19).replace('T', ' ') : String(expense[col])
  )

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ values: [row] }),
  })

  const data: unknown = await res.json()
  if (!res.ok) {
    const message = isSheetsError(data) ? data.error.message : `Sheets API error ${res.status}`
    throw new Error(message)
  }
}

/**
 * Reads all expenses from every YYYY-MM tab in the spreadsheet.
 * Used by the bidirectional sync (useSheetsSync) to pull rows missing from IndexedDB.
 */
export async function fetchExpenses(
  spreadsheetId: string,
  accessToken: string
): Promise<Expense[]> {
  const allTabs = await fetchSheetNames(spreadsheetId, accessToken)
  const monthTabs = allTabs.filter((t) => MONTH_TAB_REGEX.test(t))
  if (monthTabs.length === 0) return []

  // Single batchGet call for all month tabs — skips header row 1 on each.
  const params = monthTabs.map((t) => `ranges=${encodeURIComponent(`${t}!A2:F`)}`).join('&')

  const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}/values:batchGet?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data: unknown = await res.json()

  if (!res.ok) {
    const message = isSheetsError(data) ? data.error.message : `Sheets API error ${res.status}`
    throw new Error(message)
  }

  const body = data as { valueRanges?: { values?: string[][] }[] }
  const allRows = (body.valueRanges ?? []).flatMap((vr) => vr.values ?? [])

  return allRows.flatMap((row) => {
    const [id, amountStr, category, description, date, createdAt] = row
    const amount = parseFloat(amountStr ?? '')
    if (!id || isNaN(amount) || !category || !date || !createdAt) return []
    return [{ id, amount, category, description: description ?? '', date, createdAt }]
  })
}
