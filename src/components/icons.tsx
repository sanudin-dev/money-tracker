/** Brand/integration icons and integration metadata used across the app. */

import { WebhookIcon } from 'lucide-react'
import { INTEGRATION_LABELS } from '@/lib/constants'
import type { IntegrationType } from '@/types'

export function NotionIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-.777 6.807-6.990 7.193L24.970 99.967c-4.857.387-7.193-.193-9.72-3.300L4.410 83.023C1.690 79.337 .723 76.613.723 73.30V11.203C.723 7.510 1.500 4.700 6.017 4.313z"
        fill="#fff"
      />
      <path
        d="M61.350.227L6.017 4.313C1.500 4.700.723 7.510.723 11.203V73.30c0 3.313.967 6.037 3.687 9.723l10.840 13.644c2.527 3.107 4.863 3.687 9.720 3.300l63.753-3.883c6.213-.387 6.990-2.917 6.990-7.193V17.640c0-2.14-.78-2.780-3.31-4.543L74.167 3.143C69.893.037 68.147-.357 61.350.227zM25.833 19.443c-5.893.403-7.233.490-10.570-2.200L9.030 12.533c-.873-.777-.487-1.750 1.166-1.943l53.383-3.880c4.473-.387 6.797 1.167 8.543 2.527l9.123 6.617c.390.193 1.360 1.360 0 1.360l-55.027 3.300-.387-.07zM19.870 85.513V30.750c0-2.527.777-3.700 3.107-3.883l60.443-3.497c2.140-.193 3.107 1.167 3.107 3.690v54.18c0 2.527-.390 4.660-3.883 4.853l-57.723 3.300c-3.497.193-5.050-1.167-5.050-3.880zm56.990-52.607c.387 1.750 0 3.500-1.750 3.693l-2.913.577v42.773c-2.527 1.360-4.860 2.140-6.803 2.140-3.107 0-3.883-.973-6.21-3.883l-19.03-29.94v28.967l6.020 1.360s0 3.500-4.860 3.500l-13.400.777c-.390-.777 0-2.720 1.360-3.107l3.497-1.167V39.633l-4.860-.390c-.387-1.750.583-4.277 3.303-4.470l14.367-.973 19.807 30.323v-26.83l-5.050-.583c-.387-2.140 1.167-3.700 3.107-3.883l13.400-.777z"
        fill="#000"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function SheetsIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fill="#0F9D58" d="M14 0H2C.9 0 0 .9 0 2v20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6l-6-6z" />
      <path fill="#87CEAC" d="M14 0v6h6l-6-6z" />
      <rect fill="white" x="3" y="9" width="14" height="11" />
      <rect fill="#0F9D58" x="8.5" y="9" width="0.75" height="11" />
      <rect fill="#0F9D58" x="3" y="13" width="14" height="0.75" />
      <rect fill="#0F9D58" x="3" y="17" width="14" height="0.75" />
    </svg>
  )
}

export function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

/** Per-integration label and icon, keyed by IntegrationType. Single source of truth. */
export const INTEGRATION_META: Record<
  IntegrationType,
  { label: string; Icon: React.FC<{ className?: string }> }
> = {
  webhook: { label: INTEGRATION_LABELS.webhook, Icon: WebhookIcon },
  sheets: { label: INTEGRATION_LABELS.sheets, Icon: SheetsIcon },
  notion: { label: INTEGRATION_LABELS.notion, Icon: NotionIcon },
}
