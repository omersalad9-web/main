import { cn } from '@/lib/utils'
import type { FXRate } from '@/types'

interface Props {
  rates: FXRate[]
  variant?: 'grid' | 'table'
  className?: string
}

const PAIR_FLAGS: Record<string, string> = {
  'USD/NGN': '🇳🇬', 'USD/KES': '🇰🇪', 'USD/GHS': '🇬🇭',
  'USD/ZAR': '🇿🇦', 'USD/EGP': '🇪🇬', 'USD/MAD': '🇲🇦',
  'USD/ETB': '🇪🇹', 'USD/TZS': '🇹🇿', 'USD/UGX': '🇺🇬',
  'USD/RWF': '🇷🇼', 'USD/AOA': '🇦🇴', 'USD/XOF': '🇸🇳',
  'EUR/NGN': '🇳🇬', 'GBP/NGN': '🇳🇬',
}

function PctChange({ value }: { value: number }) {
  if (value > 0) return (
    <span className="text-[0.65rem] font-semibold text-[#1a6b3c]">▲ +{value.toFixed(2)}%</span>
  )
  if (value < 0) return (
    <span className="text-[0.65rem] font-semibold text-[#8b1a1a]">▼ {value.toFixed(2)}%</span>
  )
  return <span className="text-[0.65rem] text-ink/30">—</span>
}

export function FXRates({ rates, variant = 'grid', className }: Props) {
  if (!rates || rates.length === 0) {
    return (
      <div className={cn('grid grid-cols-2 gap-2', className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 skeleton rounded-sm" />
        ))}
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 gap-x-3 gap-y-0', className)}>
        {rates.map((r) => (
          <div
            key={r.pair}
            className="flex items-center justify-between py-2 border-b border-ink/8"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{PAIR_FLAGS[r.pair] ?? '💱'}</span>
              <span
                className="text-[0.65rem] font-semibold text-ink/80 tracking-wide"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {r.pair}
              </span>
            </div>
            <div className="text-right">
              <div
                className="text-[0.8rem] font-semibold text-ink tabular-nums"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {r.rate.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <PctChange value={r.change_pct} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // table variant
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-ink/15">
            {['Pair', 'Rate', 'Change'].map((h) => (
              <th
                key={h}
                className="pb-2 text-left text-[0.6rem] font-semibold tracking-[0.1em] uppercase text-[#C9A84C] px-2 first:pl-0"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <tr key={r.pair} className="border-b border-ink/8 hover:bg-[#C9A84C]/4 transition-colors">
              <td className="py-2 pl-0 px-2">
                <div className="flex items-center gap-2">
                  <span>{PAIR_FLAGS[r.pair] ?? '💱'}</span>
                  <span
                    className="text-[0.8125rem] font-semibold text-ink"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {r.pair}
                  </span>
                </div>
              </td>
              <td
                className="py-2 px-2 text-[0.8125rem] tabular-nums font-medium text-ink"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {r.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-2">
                <PctChange value={r.change_pct} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
