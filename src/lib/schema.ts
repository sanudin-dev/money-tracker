import { z } from 'zod'

export const configSchema = z.object({
  currencyCode: z.string().optional(),
  // webhookUrl is z.string() here (storage schema) — URL validation happens in zapierRequestSchema
  zapier: z.object({
    webhookUrl: z.string(),
    appId: z.string().optional(),
  }).optional().catch(undefined),
  sheets: z.object({
    spreadsheetId: z.string().min(1),
    refreshToken: z.string().min(1),
    connectedEmail: z.string(),
  }).optional().catch(undefined),
})

export const expenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string(),
  date: z.string(),
})

export const storedExpenseSchema = expenseSchema.extend({
  id: z.string(),
  createdAt: z.string(),
})

export const zapierRequestSchema = storedExpenseSchema.extend({
  zapierWebhookUrl: z.url(),
  appId: z.string().optional(),
})

export const sheetsWriteRequestSchema = storedExpenseSchema.extend({
  sheetsSpreadsheetId: z.string().min(1),
  sheetsRefreshToken: z.string().min(1),
})

export const sheetsReadRequestSchema = z.object({
  sheetsSpreadsheetId: z.string().min(1),
  sheetsRefreshToken: z.string().min(1),
})
