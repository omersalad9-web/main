import { cn } from '@/lib/utils'
import type { MarketSnapshot } from '@/types'

interface Props {
  snapshots: MarketSnapshot[]
  variant?: 'full' | 'compact'
  className?: string
}

const EXCHANGE_FLAGS: Record<string, string> = {
  NGX: '🇳🇬', JSE: '🇿🇦', GSE: '🇬🇭', NSE: '🇰🇪',
  EGX: '🇪🇬', CASE: '🇪🇬', USE: '🇺🇬', DSE: '🇹🇿',
  LuSE: '🇿🇲', ZSE: '🇿🇼', BRVM: '🇨🇮', MSE: '🇲🇦',
  BVMT: '🇹🇳', CSE: '🇸🇱', RSE: '🇷🇼',
}

function PctCell({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="font-semibold text-[#1a6b3c]">
        ▲ +{value.toFixed(2)}%
      </span>
    )
  }
  if (value < 0) {
    return (
      <span className="font-semibold text-[#8b1a1a]">
        ▼ {value.toFixed(2)}%
      </span>
    )
  }
  return <span className="text-ink/40">—</span>
}

export function ExchangeTable({ snapshots, variant = 'full', className }: Props) {
  if (!snapshots || snapshots.length === 0) {
    // Skeleton
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 skeleton rounded-sm" />
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-0', className)}>
        {snapshots.map((s) => (
          <div
            key={s.exchange}
            className="flex items-center justify-between py-2 border-b border-ink/8 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{EXCHANGE_FLAGS[s.exchange] ?? '🌍'}</span>
              <span
                className="text-[0.75rem] font-semibold text-ink"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {s.exchange}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-[0.75rem] text-ink/60 tabular-nums"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {s.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span
                className="text-[0.7rem] tabular-nums"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                <PctCell value={s.change_pct} />
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-ink/15">
            {['Exchange', 'Country', 'Price', 'Change', 'Volume'].map((h) => (
              <th
                key={h}
                className="pb-2 pt-1 text-left text-[0.6rem] font-semibold tracking-[0.1em] uppercase text-[#C9A84C] first:pl-0 last:pr-0 px-3"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {snapshots.map((s) => (
            <tr
              key={s.exchange}
              className="border-b border-ink/8 hover:bg-[#C9A84C]/4 transition-colors"
            >
              <td className="py-2.5 pl-0 px-3">
                <div className="flex items-center gap-2">
                  <span>{EXCHANGE_FLAGS[s.exchange] ?? '🌍'}</span>
                  <span
                    className="font-semibold text-ink text-[0.8125rem]"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {s.exchange}
                  </span>
                </div>
              </td>
              <td
                className="py-2.5 px-3 text-[0.75rem] text-ink/60"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {s.country}
              </td>
              <td
                className="py-2.5 px-3 text-[0.8125rem] tabular-nums font-medium text-ink"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {s.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
              <td
                className="py-2.5 px-3 text-[0.8125rem] tabular-nums"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                <PctCell value={s.change_pct} />
              </td>
              <td
                className="py-2.5 pr-0 px-3 text-[0.75rem] text-ink/50 tabular-nums"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {s.volume != null
                  ? Number(s.volume).toLocaleString(undefined, { notation: 'compact' })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
