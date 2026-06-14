/** The supported integration output channels. Extend this union to add future integrations. */
export type IntegrationType = 'webhook' | 'sheets' | 'notion'

export interface WebhookIntegration {
  webhookUrl: string
  appId?: string
}

export interface SheetsIntegration {
  spreadsheetId: string
  refreshToken: string
  connectedEmail: string
}

export interface NotionIntegration {
  databaseId: string
  encryptedToken: string
}

export interface Config {
  currencyCode: string
  webhook?: WebhookIntegration
  sheets?: SheetsIntegration
  notion?: NotionIntegration
}

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
}
