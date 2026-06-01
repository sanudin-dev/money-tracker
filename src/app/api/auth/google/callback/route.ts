import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/encrypt'

type TokenResponse = {
  access_token?: string
  refresh_token?: string
  error?: string
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/settings/connect?authError=cancelled`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/settings/connect?authError=not_configured`)
  }

  let tokens: TokenResponse
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })
    tokens = await res.json() as TokenResponse
    if (!res.ok || !tokens.refresh_token) {
      return NextResponse.redirect(`${origin}/settings/connect?authError=token_failed`)
    }
  } catch {
    return NextResponse.redirect(`${origin}/settings/connect?authError=token_failed`)
  }

  let email = ''
  if (tokens.access_token) {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` },
      })
      if (res.ok) {
        const user = await res.json() as { email?: string }
        email = user.email ?? ''
      }
    } catch {
      // email is display-only, safe to skip
    }
  }

  const params = new URLSearchParams({ sheetsRefreshToken: encrypt(tokens.refresh_token) })
  if (email) params.set('sheetsEmail', email)

  return NextResponse.redirect(`${origin}/settings/connect?${params}`)
}
