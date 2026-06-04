import type { IntegrationType } from '@/types'

export const INTEGRATION_LABELS: Record<IntegrationType, string> = {
  webhook: 'Webhook',
  sheets: 'Sheets API',
}

export const API = {
  WEBHOOK: '/api/webhook',
  SHEETS: '/api/sheets',
} as const

export const STORAGE_KEYS = {
  GUIDE_CHECKLIST: 'mt_guide_checklist',
  CONFIG: 'mt_config',
} as const

/** Returns the localStorage key for the sync queue of a given integration. */
export function syncQueueKey(integration: IntegrationType): string {
  return `mt_sync_queue_${integration}`
}
