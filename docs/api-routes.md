# API routes

All routes are thin proxies. They never store credentials server-side or log sensitive data.
Standard response shape: `{ ok: boolean; error?: string }`.

---

## GET /api/auth/google

Redirects the browser to the Google OAuth 2.0 consent screen.

- Scopes: `spreadsheets`, `email`
- Requires `GOOGLE_CLIENT_ID` in `.env.local`
- Redirect URI: `{origin}/api/auth/google/callback` (dynamic — works on localhost and production)

---

## GET /api/auth/google/callback

Exchanges the OAuth authorisation code for tokens.

1. Calls `https://oauth2.googleapis.com/token` with the code
2. Fetches user email from `/oauth2/v2/userinfo`
3. Encrypts the refresh token with AES-256-GCM using `ENCRYPTION_KEY`
4. Redirects to `/settings/connect?sheetsRefreshToken=<encrypted>&sheetsEmail=...`

- Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ENCRYPTION_KEY` in `.env.local`
- On any failure, redirects to `/settings/connect?authError=<reason>`

---

## POST /api/webhook

Forwards the expense payload to the user's webhook URL.

**Request body** (validated with Zod):

```ts
{
  ...Expense fields,
  webhookUrl: string,   // supplied by the client, never stored server-side
  appId?: string        // optional app identifier; forwarded as-is to the webhook
}
```

The `webhookUrl` is extracted and used as the destination. Everything else — including `appId` if present — is forwarded in the request body. Users can add a filter step in their automation platform to check `appId`.

---

## POST /api/sheets

Appends a row to the user's Google Sheet.

**Request body**:

```ts
{
  ...Expense fields,
  sheetsSpreadsheetId: string,
  sheetsRefreshToken: string   // AES-256-GCM encrypted blob
}
```

Decrypts the token with `ENCRYPTION_KEY`, then exchanges it for an access token before writing.

---

## GET /api/sheets

Returns all expense rows from the user's Google Sheet.

**Query params**: `sheetsSpreadsheetId`, `sheetsRefreshToken` (encrypted blob)

Returns `{ ok: true; expenses: Expense[] }` or `{ ok: false; error: string }`.

Decrypts the token with `ENCRYPTION_KEY` before use. Returns 401 if decryption fails (user must reconnect).

---

## Security model

- Credentials travel in the request body (never stored in env vars on the server)
- Zod validates all inputs before any external call is made
- No credentials are logged at any point
- The refresh token is encrypted with AES-256-GCM before being sent to the client; the server decrypts it on each request using `ENCRYPTION_KEY` — a plaintext token is never stored in the browser
