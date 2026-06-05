import { NextRequest, NextResponse } from 'next/server'
import { webhookRequestSchema } from '@/lib/schema'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = webhookRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' },
      { status: 400 }
    )
  }

  const { webhookUrl, ...expense } = parsed.data

  let res: Response
  try {
    res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to reach webhook.' }, { status: 502 })
  }

  if (!res.ok) {
    const hint =
      res.status === 404
        ? 'Webhook not found — make sure the URL is correct and the automation is active.'
        : `Webhook returned ${res.status}.`
    return NextResponse.json({ ok: false, error: hint }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
