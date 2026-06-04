# Money Tracker

Track personal expenses locally with optional sync to a webhook (Zapier, Make, Pipedream, n8n, etc.) and/or Google Sheets. Works offline. Installable as a PWA on any device.

**Live demo → [mt.sanudin.dev](https://mt.sanudin.dev)**

---

## Features

- Add expenses with category, date, and optional description
- Browse history by month with per-category breakdown
- Edit and delete past entries
- Local-first — data lives on-device (IndexedDB); history always available offline
- Optional sync to a webhook (Zapier, Make, Pipedream, n8n, etc.) and/or Google Sheets (both can be active simultaneously)
- Multi-currency support
- CSV export — always available from local history
- PWA — install on Android, iOS, or desktop; works fully offline
- Offline sync queue — expenses saved to device and pushed when back online

---

## Integrations

Both integrations are optional and independent — enable neither, one, or both at the same time.

| | Webhook | Sheets API |
|---|---|---|
| Setup | ~5 min | ~2 min |
| What it does | Sends each expense to any webhook-connected app (Zapier, Make, Pipedream, n8n, etc.) | Writes directly to a Google Sheet |
| Cost | Depends on platform | Free |

See the [Integrations page](https://mt.sanudin.dev/compare) for details.

---

## Stack

Next.js 16 App Router · TypeScript · Tailwind CSS · IndexedDB (`idb`) · Zod · `@ducanh2912/next-pwa`

---

## Run locally

```bash
git clone https://github.com/sanudin-dev/money-tracker
cd money-tracker
npm install
npm run dev
```

**Works immediately without any credentials** — expenses save locally to IndexedDB.

To enable Google Sheets sync, create `.env.local` (see `.env.example`):

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
ENCRYPTION_KEY=<output of: openssl rand -base64 32>
```

See the [Developer page](https://mt.sanudin.dev/dev) for the full Google Cloud setup guide (enable Sheets API, create OAuth client, add redirect URIs).

---

## Deploy

Standard Next.js app — deploy to [Vercel](https://vercel.com), [Netlify](https://netlify.com), [Render](https://render.com), or any Node.js host. No database required.

For Google Sheets sync, set these environment variables on your host:

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
ENCRYPTION_KEY
```

Also add your production domain's callback URL to Google Cloud Console:
`https://your-domain.com/api/auth/google/callback`

---

## Install on your device

Open [mt.sanudin.dev](https://mt.sanudin.dev) in a browser and follow the [Install guide](https://mt.sanudin.dev/install):

- **Android**: Chrome → menu → Add to Home Screen
- **iOS**: Safari → Share → Add to Home Screen
- **Desktop**: Chrome or Edge → install icon in address bar
