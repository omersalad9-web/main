'use client'

import { cn } from '@/lib/utils'

interface Props {
  signal: 'BUY' | 'WATCH' | 'SELL' | 'HOLD'
  size?: 'sm' | 'md' | 'lg'
}

export function SignalBadge({ signal, size = 'md' }: Props) {
  const colors = {
    BUY:   'bg-emerald-950 text-emerald-400 border-emerald-800',
    SELL:  'bg-red-950 text-red-400 border-red-800',
    WATCH: 'bg-amber-950 text-amber-400 border-amber-800',
    HOLD:  'bg-blue-950 text-blue-400 border-blue-800',
  }

  const sizes = {
    sm: 'text-[0.55rem] px-1.5 py-0.5',
    md: 'text-[0.625rem] px-2 py-1',
    lg: 'text-xs px-3 py-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold tracking-[0.1em] uppercase border rounded-sm',
        colors[signal],
        sizes[size],
      )}
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      {signal}
    </span>
  )
}
