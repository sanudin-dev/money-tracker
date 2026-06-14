import { NextRequest, NextResponse } from 'next/server'
import { notionWriteRequestSchema, notionReadRequestSchema } from '@/lib/schema'
import { appendExpense, fetchExpenses } from '@/lib/notion'
import { decrypt } from '@/lib/encrypt'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = notionWriteRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' },
      { status: 400 }
    )
  }

  const { notionDatabaseId, notionToken: encryptedToken, ...expense } = parsed.data

  let token: string
  try {
    token = decrypt(encryptedToken)
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid credentials — please reconnect Notion.' },
      { status: 401 }
    )
  }

  try {
    await appendExpense(notionDatabaseId, token, expense)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to write to Notion.'
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query = {
    notionDatabaseId: searchParams.get('notionDatabaseId') ?? '',
    notionToken: searchParams.get('notionToken') ?? '',
  }

  const parsed = notionReadRequestSchema.safeParse(query)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Missing notionDatabaseId or notionToken.' },
      { status: 400 }
    )
  }

  let token: string
  try {
    token = decrypt(parsed.data.notionToken)
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid credentials — please reconnect Notion.' },
      { status: 401 }
    )
  }

  try {
    const expenses = await fetchExpenses(parsed.data.notionDatabaseId, token)
    return NextResponse.json({ ok: true, expenses })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to read from Notion.'
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}
