export function evaluateAmount(input: string): number | null {
  const expr = input.replace(/\s/g, '')
  if (!expr) return null
  if (!/^\d+\.?\d*([+\-]\d+\.?\d*)*$/.test(expr)) return null
  const parts = expr.split(/([+\-])/)
  let result = 0
  let sign = 1
  for (const part of parts) {
    if (part === '+') sign = 1
    else if (part === '-') sign = -1
    else {
      const n = parseFloat(part)
      if (isNaN(n)) return null
      result += sign * n
    }
  }
  const rounded = parseFloat(result.toFixed(2))
  return rounded > 0 ? rounded : null
}
