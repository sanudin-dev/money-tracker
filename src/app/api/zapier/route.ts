import { NextRequest, NextResponse } from 'next/server'
import { zapierRequestSchema } from '@/lib/schema'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = zapierRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, { status: 400 })
  }

  const { zapierWebhookUrl, ...expense } = parsed.data

  let res: Response
  try {
    res = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to reach Zapier webhook.' }, { status: 502 })
  }

  if (!res.ok) {
    const hint = res.status === 404
      ? 'Zapier webhook not found — make sure your Zap is turned on.'
      : `Zapier returned ${res.status}.`
    return NextResponse.json({ ok: false, error: hint }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
