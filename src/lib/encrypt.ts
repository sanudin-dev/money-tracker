import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY env var is not set.')
  const buf = Buffer.from(key, 'base64')
  if (buf.length !== 32)
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes (base64-encoded).')
  return buf
}

/** Encrypts a UTF-8 string with AES-256-GCM. Returns a compact `iv:tag:ciphertext` string (all base64). Server-only. */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(':')
}

/** Decrypts a string produced by encrypt(). Throws on wrong key, tampered data, or invalid format. Server-only. */
export function decrypt(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split(':')
  if (parts.length !== 3)
    throw new Error('Invalid encrypted token format — please reconnect Google Sheets.')
  const [ivB64, tagB64, dataB64] = parts
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const data = Buffer.from(dataB64, 'base64')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}
