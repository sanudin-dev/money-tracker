import { CodeXmlIcon } from "lucide-react";

export const metadata = {
  title: 'Developer — Money Tracker',
  description: 'Technical comparison and one-time server setup guide for deploying Money Tracker.',
}

type Row = { label: string; webhook: string; sheets: string }

const COMPARISON_ROWS: Row[] = [
  {
    label: 'Auth model',
    webhook: 'None — webhook URL passed in the request body; no server-side secrets needed',
    sheets:
      'OAuth 2.0 Authorization Code Flow — GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env.local; refresh token encrypted (AES-256-GCM) and stored in client localStorage',
  },
  {
    label: 'Server credentials',
    webhook: 'None',
    sheets: 'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ENCRYPTION_KEY (never exposed to the client)',
  },
  {
    label: 'Write path',
    webhook: 'POST /api/webhook → validate body → forward to webhook URL',
    sheets:
      'POST /api/sheets → refreshAccessToken() → getOrCreateMonthTab (YYYY-MM) → Google Sheets values.append',
  },
  {
    label: 'Read path',
    webhook: 'Not implemented — fire-and-forget',
    sheets:
      'GET /api/sheets → refreshAccessToken() → values.get → row parsing; powers bidirectional sync (useSheetsSync)',
  },
  {
    label: 'Token handling',
    webhook: 'N/A',
    sheets:
      'Server-side only: POST oauth2.googleapis.com/token with refresh_token; client never receives an access_token',
  },
  {
    label: 'API route size',
    webhook: '~15 lines — validate + proxy',
    sheets: '~80 lines — token refresh, API call, error handling, row mapping',
  },
  {
    label: 'Error visibility',
    webhook:
      'Automation platform logs (external) — app receives only an HTTP 200/error from the platform',
    sheets: 'Structured Google API errors — typed HTTP 4xx/5xx with messages',
  },
  {
    label: 'Third-party in write path',
    webhook:
      'Yes — automation platform; swap the destination (Notion, Airtable, Slack) with zero code changes',
    sheets: 'No — direct Google API; you own the entire write path',
  },
  {
    label: 'Extensibility',
    webhook: 'Depends on the automation platform and what actions it supports',
    sheets: 'Full control — add delete, update, any Sheets API feature',
  },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>
    </section>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
      {children}
    </code>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
        {n}
      </span>
      <div className="flex flex-col gap-1.5 pt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
        {children}
      </div>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
      {children}
    </p>
  )
}

export default function DevPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <CodeXmlIcon className="h-6 w-6" />
          Developer
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Technical comparison and one-time setup guide for deploying this app.
        </p>
      </div>

      {/* Technical comparison */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Technical comparison
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          How the two integrations differ at the implementation level.
        </p>
        <div className="overflow-x-auto">
          <div className="min-w-[540px] overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500"></span>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                Webhook
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                Sheets API
              </span>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 gap-4 px-4 py-3 text-sm ${
                  i < COMPARISON_ROWS.length - 1
                    ? 'border-b border-zinc-100 dark:border-zinc-800'
                    : ''
                }`}
              >
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{row.label}</span>
                <span className="text-zinc-600 dark:text-zinc-400">{row.webhook}</span>
                <span className="text-zinc-600 dark:text-zinc-400">{row.sheets}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Section title="How the integrations work">
        <p>
          <strong className="text-zinc-700 dark:text-zinc-300">Webhook</strong> — the app acts as a
          thin proxy. The client sends the expense payload plus the user&apos;s webhook URL to{' '}
          <Code>/api/webhook</Code>. The route validates the body and forwards it to the URL. The
          automation platform handles the rest — no Google credentials are ever needed on the
          server. Works with Zapier, Make, Pipedream, n8n, or any service that accepts a POST
          request.
        </p>
        <p className="mt-2">
          <strong className="text-zinc-700 dark:text-zinc-300">Sheets API</strong> — the app
          implements the full OAuth 2.0 Authorization Code Flow. The user authorises once via the
          Google consent screen; the server exchanges the auth code for a refresh token and stores
          it in the client&apos;s localStorage. Every subsequent API call (write or read) calls{' '}
          <Code>refreshAccessToken()</Code> server-side first — the client never sees an access
          token. The refresh token persists indefinitely until the user revokes access from their
          Google account settings.
        </p>
        <p className="mt-2">
          The OAuth callback route (<Code>/api/auth/google/callback</Code>) exchanges the code for
          tokens, fetches the user&apos;s email, then redirects to <Code>/settings/connect</Code>{' '}
          with the refresh token and email as URL params. <Code>ConfigForm</Code> reads and saves
          these on mount, then immediately calls <Code>history.replaceState</Code> to remove them
          from the URL.
        </p>
        <p className="mt-2">
          <strong className="text-zinc-700 dark:text-zinc-300">Bidirectional sync</strong> — the{' '}
          <Code>useSheetsSync</Code> hook (called from the history page) uses the same{' '}
          <Code>GET /api/sheets</Code> endpoint to fetch all rows, diffs them against IndexedDB by{' '}
          <Code>id</Code>, pulls missing rows into local storage, then pushes local-only expenses
          back to the sheet. This lets two devices sharing the same spreadsheet ID stay in sync
          without a backend database.
        </p>
      </Section>

      {/* Developer setup */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Developer setup
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            What you need to do once before deploying, per integration.
          </p>
        </div>

        {/* Webhook setup */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Webhook — no server setup required
          </h3>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              The webhook URL is provided by the user at runtime — it&apos;s passed in the request
              body and never stored server-side. There are no environment variables to set and no
              third-party configuration needed. Deploy the app and users can connect any automation
              platform immediately.
            </p>
          </div>
        </div>

        {/* Sheets API setup */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Sheets API — one-time Google Cloud setup
          </h3>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col gap-5">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                This setup is done once by the developer. After it&apos;s complete, any user can
                connect their Google account without any further configuration.
              </p>

              <Step n={1}>
                <span>
                  Go to{' '}
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    console.cloud.google.com
                  </span>{' '}
                  and create or select a project.
                </span>
                <ul className="ml-4 list-disc space-y-1">
                  <li>
                    <strong>APIs &amp; Services → Library</strong> → search for{' '}
                    <strong>Google Sheets API</strong> → Enable
                  </li>
                </ul>
              </Step>

              <Step n={2}>
                <span>Create OAuth credentials:</span>
                <ul className="ml-4 list-disc space-y-1">
                  <li>
                    <strong>
                      APIs &amp; Services → Credentials → Create Credentials → OAuth 2.0 Client ID
                    </strong>
                  </li>
                  <li>
                    Application type: <strong>Web application</strong>
                  </li>
                  <li>
                    Authorised redirect URIs — add both:
                    <div className="mt-1.5 flex flex-col gap-1">
                      <Code>http://localhost:3000/api/auth/google/callback</Code>
                      <Code>https://your-production-domain.com/api/auth/google/callback</Code>
                    </div>
                  </li>
                  <li>
                    Copy the <strong>Client ID</strong> and <strong>Client Secret</strong>
                  </li>
                </ul>
              </Step>

              <Step n={3}>
                <span>
                  Add the credentials to <Code>.env.local</Code> (local) and your hosting platform
                  (production):
                </span>
                <div className="mt-1 rounded-md bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  GOOGLE_CLIENT_ID=your-client-id
                  <br />
                  GOOGLE_CLIENT_SECRET=your-client-secret
                  <br />
                  ENCRYPTION_KEY=your-32-byte-base64-key
                </div>
                <span>
                  Generate <Code>ENCRYPTION_KEY</Code> with: <Code>openssl rand -base64 32</Code>
                </span>
                <span>Restart the dev server after saving.</span>
              </Step>

              <Step n={4}>
                <span>
                  If your Google Cloud project is in <strong>Testing</strong> mode, add test users:
                </span>
                <ul className="ml-4 list-disc space-y-1">
                  <li>
                    <strong>OAuth consent screen → Test users → Add users</strong>
                  </li>
                  <li>Add the Google accounts that will use the app</li>
                  <li>Publish the app when ready to allow any Google account to connect</li>
                </ul>
                <Note>
                  Apps in Testing mode can only be authorised by listed test users. Publishing
                  removes this restriction but triggers a Google review for sensitive scopes.
                </Note>
              </Step>
            </div>
          </div>
        </div>
      </div>

      <Section title="Credentials and security model">
        <p>
          <Code>GOOGLE_CLIENT_ID</Code>, <Code>GOOGLE_CLIENT_SECRET</Code>, and{' '}
          <Code>ENCRYPTION_KEY</Code> live in environment variables and are only used server-side.
          They are never sent to the client.
        </p>
        <p className="mt-2">
          After the OAuth flow completes, the server encrypts the refresh token with AES-256-GCM
          using
          <Code>ENCRYPTION_KEY</Code> before sending it to the client. The encrypted blob is stored
          in <Code>localStorage</Code>. When the client calls <Code>/api/sheets</Code>, it sends the
          blob; the server decrypts it, exchanges it for a short-lived access token, makes the
          Google Sheets call, and discards both. The access token and plaintext refresh token never
          reach the client.
        </p>
        <p className="mt-2">
          The webhook URL is stored in <Code>localStorage</Code> and sent in the request body. It is
          a shared secret — anyone who obtains it can POST to the webhook. The app never logs any
          credential server-side.
        </p>
      </Section>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Source code:{' '}
          <a
            href="https://github.com/sanudin-dev/money-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-700 underline underline-offset-2 dark:text-zinc-300"
          >
            github.com/sanudin-dev/money-tracker
          </a>
        </p>
      </div>
    </div>
  )
}
