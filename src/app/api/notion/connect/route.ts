import { NextRequest, NextResponse } from 'next/server'
import { notionConnectRequestSchema } from '@/lib/schema'
import { validateDatabase } from '@/lib/notion'
import { encrypt } from '@/lib/encrypt'

/** Validates Notion credentials and returns an encrypted token for client-side storage. */
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = notionConnectRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' },
      { status: 400 }
    )
  }

  const { databaseId, notionToken } = parsed.data

  try {
    await validateDatabase(databaseId, notionToken)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not connect to Notion database.'
    return NextResponse.json({ ok: false, error: message }, { status: 401 })
  }

  let encryptedToken: string
  try {
    encryptedToken = encrypt(notionToken)
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Server encryption is not configured (ENCRYPTION_KEY missing).' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, encryptedToken })
}
