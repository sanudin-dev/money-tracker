/** The supported integration output channels. Extend this union to add future integrations. */
export type IntegrationType = 'zapier' | 'sheets'

export interface ZapierIntegration {
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
  zapier?: ZapierIntegration
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
