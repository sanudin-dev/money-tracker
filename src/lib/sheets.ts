import type { Expense } from '@/types'

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const SHEET_NAME = 'Sheet1'
const COLUMNS = ['id', 'amount', 'category', 'description', 'date', 'createdAt'] as const
// User-friendly header names written to row 1 when the sheet is first used.
// These match the column names Zapier uses so both modes produce the same sheet layout.
const HEADER_ROW = ['ID', 'Amount', 'Category', 'Description', 'Date', 'Created At']

type SheetsError = { error: { code: number; message: string } }

function isSheetsError(data: unknown): data is SheetsError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as SheetsError).error?.message === 'string'
  )
}

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

  const data = await res.json() as { access_token?: string; error?: string }
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? 'Failed to refresh Google access token.')
  }
  return data.access_token
}

/** Writes the header row to A1 if the sheet is empty. Called once before the first append. */
async function ensureHeaders(spreadsheetId: string, accessToken: string): Promise<void> {
  const checkRes = await fetch(
    `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(`${SHEET_NAME}!A1`)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  const checkData = await checkRes.json() as { values?: string[][] }
  if (checkData.values?.[0]?.[0]) return

  await fetch(
    `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(`${SHEET_NAME}!A1:F1`)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ values: [HEADER_ROW] }),
    },
  )
}

/** Appends a single expense row to the sheet, writing headers first if the sheet is new. */
export async function appendExpense(
  spreadsheetId: string,
  accessToken: string,
  expense: Expense,
): Promise<void> {
  await ensureHeaders(spreadsheetId, accessToken)

  const range = `${SHEET_NAME}!A1`
  // RAW keeps all cell values as plain text so date/time strings are stored exactly
  // as sent — consistent with what Zapier writes when it receives the same JSON payload.
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`

  const row = COLUMNS.map((col) => String(expense[col]))

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ values: [row] }),
  })

  const data: unknown = await res.json()

  if (!res.ok) {
    const message = isSheetsError(data) ? data.error.message : `Sheets API error ${res.status}`
    throw new Error(message)
  }
}

export async function fetchExpenses(
  spreadsheetId: string,
  accessToken: string,
): Promise<Expense[]> {
  const range = `${SHEET_NAME}!A2:F`
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })
  const data: unknown = await res.json()

  if (!res.ok) {
    const message = isSheetsError(data) ? data.error.message : `Sheets API error ${res.status}`
    throw new Error(message)
  }

  const body = data as { values?: string[][] }
  const rows = body.values ?? []

  return rows.flatMap((row) => {
    const [id, amountStr, category, description, date, createdAt] = row
    const amount = parseFloat(amountStr ?? '')
    if (!id || isNaN(amount) || !category || !date || !createdAt) return []
    return [{ id, amount, category, description: description ?? '', date, createdAt }]
  })
}
