export const metadata = {
  title: 'Privacy Policy — Money Tracker',
  description: 'How Money Tracker handles your data — stored on your device, never on a server.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Last updated: May 2026</p>
      </div>

      {/* Testing mode notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-800/50 dark:bg-amber-900/20">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
          App currently in testing mode
        </p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
          The Google Sheets integration is currently limited to approved test accounts. If
          you&apos;d like to try it, get in touch and I&apos;ll add your Google account to the list.
        </p>
        <a
          href="mailto:hello.sanudin@gmail.com"
          className="mt-2 inline-block text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
        >
          hello.sanudin@gmail.com
        </a>
      </div>

      <Section title="Overview">
        <p>
          Money Tracker is a personal expense tracking app. This policy explains what data the app
          accesses, where it is stored, and how it is used. The short version: your data stays on
          your device and in your own Google Sheet — nothing is stored on any external server.
        </p>
      </Section>

      <Section title="Data stored on your device">
        <p>The app stores the following locally in your browser:</p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong className="text-zinc-700 dark:text-zinc-300">Expenses</strong> — saved to
            IndexedDB in your browser. Never sent anywhere unless you have an integration
            configured.
          </li>
          <li>
            <strong className="text-zinc-700 dark:text-zinc-300">Settings</strong> — your currency
            and integration credentials stored in{' '}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              localStorage
            </code>
            .
          </li>
          <li>
            <strong className="text-zinc-700 dark:text-zinc-300">Google refresh token</strong>{' '}
            (Sheets API integration) — stored encrypted (AES-256-GCM) in{' '}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              localStorage
            </code>
            . The plaintext token is only ever held server-side during an active API request. You
            can revoke it at any time from your Google account.
          </li>
          <li>
            <strong className="text-zinc-700 dark:text-zinc-300">Webhook URL</strong> (Webhook
            integration) — stored in{' '}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              localStorage
            </code>
            . Treat it as a private link.
          </li>
        </ul>
      </Section>

      <Section title="Google account access (Sheets API)">
        <p>
          When you use the <strong className="text-zinc-700 dark:text-zinc-300">Sheets API</strong>{' '}
          integration, the app requests access to Google Sheets with the following scope:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              https://www.googleapis.com/auth/spreadsheets
            </code>{' '}
            — read and write access to Google Sheets, used solely to append and fetch expense rows
            in the spreadsheet you specify.
          </li>
          <li>
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              email
            </code>{' '}
            — your email address, displayed in the app to confirm which account is connected.
          </li>
        </ul>
        <p className="mt-2">
          The app only accesses the specific spreadsheet you provide. It does not read, modify, or
          list any other files in your Google Drive or Google account.
        </p>
        <p className="mt-2">
          Your Google credentials are never logged or stored on any server. The refresh token is
          encrypted with AES-256-GCM before being stored in your browser&apos;s{' '}
          <code className="rounded bg-zinc-100 px-1 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            localStorage
          </code>
          . When you make an API call, the encrypted blob is sent to the server, decrypted using a
          server-only key, and used solely to obtain a short-lived access token for that request.
          Access tokens and plaintext refresh tokens are never returned to or stored by the client.
        </p>
      </Section>

      <Section title="No server-side data storage">
        <p>
          This app has no database. No expense data, no credentials, and no personal information are
          persisted on any server. Each API request is stateless — credentials are passed in the
          request body, used for that request only, and discarded.
        </p>
      </Section>

      <Section title="Third-party services">
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong className="text-zinc-700 dark:text-zinc-300">Google Sheets API</strong> — used
            via the Sheets API integration to read and write expense data to your spreadsheet.
            Subject to{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Google&apos;s Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong className="text-zinc-700 dark:text-zinc-300">Webhook destination</strong> — when
            the Webhook integration is active, expense data is forwarded to the URL you configure.
            The destination platform&apos;s own privacy policy applies (e.g.{' '}
            <a
              href="https://zapier.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Zapier
            </a>
            ,{' '}
            <a
              href="https://www.make.com/en/privacy-notice"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Make
            </a>
            ).
          </li>
        </ul>
      </Section>

      <Section title="Revoking access">
        <p>
          To disconnect the app from your Google account, either click{' '}
          <strong className="text-zinc-700 dark:text-zinc-300">Disconnect</strong> in Settings →
          Connect, or go to your Google account at{' '}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            myaccount.google.com/permissions
          </a>{' '}
          and remove Money Tracker. This immediately invalidates the stored refresh token.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this privacy policy or the app?{' '}
          <a href="mailto:hello.sanudin@gmail.com" className="underline underline-offset-2">
            hello.sanudin@gmail.com
          </a>
        </p>
      </Section>
    </div>
  )
}
