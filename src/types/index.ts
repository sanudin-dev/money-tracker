/** The supported integration output channels. Extend this union to add future integrations. */
export type IntegrationType = 'webhook' | 'sheets'

export interface WebhookIntegration {
  webhookUrl: string
  appId?: string
}

export interface SheetsIntegration {
  spreadsheetId: string
  refreshToken: string
  connectedEmail: string
}

export interface Config {
  currencyCode: string
  webhook?: WebhookIntegration
  sheets?: SheetsIntegration
}

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
}
