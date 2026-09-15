export function money(n: number, digits = 2): string {
  const abs = Math.abs(n)
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(abs)
  if (n < 0) return `−$${formatted}`
  return `$${formatted}`
}

export function usdt(n: number, digits = 2): string {
  const abs = Math.abs(n)
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(abs)
  if (n < 0) return `−${formatted}`
  return formatted
}

export function pct(n: number, digits = 3): string {
  return `${n.toFixed(digits)}%`
}

export function bps(n: number): string {
  return `${n.toFixed(1)} bps`
}
