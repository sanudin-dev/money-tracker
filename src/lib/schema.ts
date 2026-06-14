import { z } from 'zod'

export const configSchema = z.object({
  currencyCode: z.string().optional(),
  // webhookUrl is z.string() here (storage schema) — URL validation happens in webhookRequestSchema
  webhook: z
    .object({
      webhookUrl: z.string(),
      appId: z.string().optional(),
    })
    .optional()
    .catch(undefined),
  sheets: z
    .object({
      spreadsheetId: z.string().min(1),
      refreshToken: z.string().min(1),
      connectedEmail: z.string(),
    })
    .optional()
    .catch(undefined),
  notion: z
    .object({
      databaseId: z.string().min(1),
      encryptedToken: z.string().min(1),
    })
    .optional()
    .catch(undefined),
})

export const expenseSchema = z.object({
  amount: z
    .number({ message: 'Enter a valid amount (e.g. 12.50 or 10 + 5)' })
    .positive({ message: 'Amount must be greater than 0' }),
  category: z.string().min(1, { message: 'Please select a category' }),
  description: z.string(),
  date: z.iso.date(),
})

export const storedExpenseSchema = expenseSchema.extend({
  id: z.string(),
  createdAt: z.string(),
})

export const webhookRequestSchema = storedExpenseSchema.extend({
  webhookUrl: z.url(),
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

export const notionWriteRequestSchema = storedExpenseSchema.extend({
  notionDatabaseId: z.string().min(1),
  notionToken: z.string().min(1),
})

export const notionConnectRequestSchema = z.object({
  databaseId: z.string().min(1),
  notionToken: z.string().min(1),
})

export const notionReadRequestSchema = z.object({
  notionDatabaseId: z.string().min(1),
  notionToken: z.string().min(1),
})
