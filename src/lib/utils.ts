import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMMM d, yyyy')
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), 'MMM d')
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(2)
}

export function formatPct(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export function getSignalColor(signal: string): string {
  switch (signal) {
    case 'BUY': return 'text-signal-buy bg-signal-buy/10 border-signal-buy/30'
    case 'SELL': return 'text-signal-sell bg-signal-sell/10 border-signal-sell/30'
    case 'WATCH': return 'text-signal-watch bg-signal-watch/10 border-signal-watch/30'
    case 'HOLD': return 'text-signal-hold bg-signal-hold/10 border-signal-hold/30'
    default: return 'text-ink/60 bg-ink/5 border-ink/20'
  }
}

export function getMoveColor(move: string): string {
  switch (move) {
    case 'GAINER': return 'text-signal-buy'
    case 'LOSER': return 'text-signal-sell'
    default: return 'text-ink/60'
  }
}

export function getMoveArrow(move: string): string {
  switch (move) {
    case 'GAINER': return '▲'
    case 'LOSER': return '▼'
    default: return '—'
  }
}
