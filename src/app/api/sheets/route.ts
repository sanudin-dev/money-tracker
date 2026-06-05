import { NextRequest, NextResponse } from 'next/server'
import { sheetsWriteRequestSchema, sheetsReadRequestSchema } from '@/lib/schema'
import { appendExpense, fetchExpenses, refreshAccessToken } from '@/lib/sheets'
import { decrypt } from '@/lib/encrypt'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = sheetsWriteRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' },
      { status: 400 }
    )
  }

  const { sheetsSpreadsheetId, sheetsRefreshToken: encryptedToken, ...expense } = parsed.data

  let refreshToken: string
  try {
    refreshToken = decrypt(encryptedToken)
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid credentials — please reconnect Google Sheets.' },
      { status: 401 }
    )
  }

  let accessToken: string
  try {
    accessToken = await refreshAccessToken(refreshToken)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to authenticate with Google.'
    return NextResponse.json({ ok: false, error: message }, { status: 401 })
  }

  try {
    await appendExpense(sheetsSpreadsheetId, accessToken, expense)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to write to sheet.'
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query = {
    sheetsSpreadsheetId: searchParams.get('sheetsSpreadsheetId') ?? '',
    sheetsRefreshToken: searchParams.get('sheetsRefreshToken') ?? '',
  }

  const parsed = sheetsReadRequestSchema.safeParse(query)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Missing sheetsSpreadsheetId or sheetsRefreshToken.' },
      { status: 400 }
    )
  }

  let refreshToken: string
  try {
    refreshToken = decrypt(parsed.data.sheetsRefreshToken)
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid credentials — please reconnect Google Sheets.' },
      { status: 401 }
    )
  }

  let accessToken: string
  try {
    accessToken = await refreshAccessToken(refreshToken)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to authenticate with Google.'
    return NextResponse.json({ ok: false, error: message }, { status: 401 })
  }

  try {
    const expenses = await fetchExpenses(parsed.data.sheetsSpreadsheetId, accessToken)
    return NextResponse.json({ ok: true, expenses })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to read from sheet.'
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}
