export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
]

const REGION_TO_CURRENCY: Record<string, string> = {
  US: 'USD', ID: 'IDR', GB: 'GBP', SG: 'SGD', MY: 'MYR',
  AU: 'AUD', JP: 'JPY', KR: 'KRW', IN: 'INR', TH: 'THB',
  PH: 'PHP', VN: 'VND', CN: 'CNY', HK: 'HKD',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR', GR: 'EUR',
}

// Timezone is a more reliable signal than language: a Malaysian user with en-US language
// still has Asia/Kuala_Lumpur as their timezone.
const TIMEZONE_TO_CURRENCY: Record<string, string> = {
  'Asia/Kuala_Lumpur': 'MYR', 'Asia/Kuching': 'MYR',
  'Asia/Jakarta': 'IDR', 'Asia/Makassar': 'IDR', 'Asia/Jayapura': 'IDR', 'Asia/Pontianak': 'IDR',
  'Asia/Singapore': 'SGD',
  'Asia/Bangkok': 'THB', 'Asia/Phnom_Penh': 'THB', 'Asia/Vientiane': 'THB',
  'Asia/Manila': 'PHP',
  'Asia/Ho_Chi_Minh': 'VND', 'Asia/Saigon': 'VND',
  'Asia/Tokyo': 'JPY',
  'Asia/Seoul': 'KRW',
  'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR',
  'Asia/Shanghai': 'CNY', 'Asia/Chongqing': 'CNY', 'Asia/Harbin': 'CNY', 'Asia/Urumqi': 'CNY',
  'Asia/Hong_Kong': 'HKD',
  'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD', 'Australia/Brisbane': 'AUD',
  'Australia/Perth': 'AUD', 'Australia/Adelaide': 'AUD', 'Australia/Darwin': 'AUD',
  'Australia/Hobart': 'AUD', 'Australia/Lord_Howe': 'AUD',
  'Europe/London': 'GBP',
  'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR', 'Europe/Rome': 'EUR', 'Europe/Madrid': 'EUR',
  'Europe/Amsterdam': 'EUR', 'Europe/Brussels': 'EUR', 'Europe/Vienna': 'EUR',
  'Europe/Athens': 'EUR', 'Europe/Helsinki': 'EUR', 'Europe/Lisbon': 'EUR',
  'Europe/Dublin': 'EUR', 'Europe/Luxembourg': 'EUR', 'Europe/Malta': 'EUR',
  'Europe/Nicosia': 'EUR', 'Europe/Riga': 'EUR', 'Europe/Tallinn': 'EUR', 'Europe/Vilnius': 'EUR',
  'America/New_York': 'USD', 'America/Chicago': 'USD', 'America/Denver': 'USD',
  'America/Los_Angeles': 'USD', 'America/Phoenix': 'USD', 'America/Anchorage': 'USD',
  'Pacific/Honolulu': 'USD',
}

export function detectDefaultCurrency(): string {
  if (typeof window === 'undefined') return 'USD'
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && TIMEZONE_TO_CURRENCY[tz]) return TIMEZONE_TO_CURRENCY[tz]
    const region = new Intl.Locale(navigator.language).region ?? ''
    return REGION_TO_CURRENCY[region] ?? 'USD'
  } catch {
    return 'USD'
  }
}

export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`
  }
}

export function getCurrencySymbol(currencyCode: string): string {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).formatToParts(0)
    return parts.find((p) => p.type === 'currency')?.value ?? currencyCode
  } catch {
    return currencyCode
  }
}

export function getCurrencyFractionDigits(currencyCode: string): number {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).resolvedOptions().maximumFractionDigits ?? 2
  } catch {
    return 2
  }
}
