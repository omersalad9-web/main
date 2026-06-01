'use client'

import { cn } from '@/lib/utils'
import type { ArticleMove } from '@/types'

interface Props {
  move: ArticleMove
  magnitude?: number
  size?: 'sm' | 'md' | 'lg'
  showMagnitude?: boolean
}

export function MoveBadge({ move, magnitude, size = 'md', showMagnitude = false }: Props) {
  const config = {
    GAINER: {
      classes: 'bg-emerald-950 text-emerald-400 border-emerald-800',
      arrow: '▲',
      label: 'Gainer',
    },
    LOSER: {
      classes: 'bg-red-950 text-red-400 border-red-800',
      arrow: '▼',
      label: 'Loser',
    },
    NEUTRAL: {
      classes: 'bg-ink/10 text-ink/60 border-ink/20',
      arrow: '—',
      label: 'Neutral',
    },
  }

  const sizes = {
    sm: 'text-[0.55rem] px-1.5 py-0.5 gap-0.5',
    md: 'text-[0.625rem] px-2 py-1 gap-1',
    lg: 'text-xs px-3 py-1.5 gap-1',
  }

  const { classes, arrow, label } = config[move]

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold tracking-[0.08em] uppercase border rounded-sm',
        classes,
        sizes[size],
      )}
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      <span>{arrow}</span>
      <span>{label}</span>
      {showMagnitude && magnitude !== undefined && (
        <span className="opacity-75 ml-0.5">
          {magnitude > 0 ? '+' : ''}
          {magnitude.toFixed(1)}%
        </span>
      )}
    </span>
  )
}
