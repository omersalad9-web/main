import { cn } from '@/lib/utils'
import type { CommodityPrice } from '@/types'

interface Props {
  commodities: CommodityPrice[]
  className?: string
}

const COMMODITY_META: Record<string, { emoji: string; producers: string[] }> = {
  'Crude Oil': { emoji: '🛢️', producers: ['Nigeria', 'Angola', 'Libya', 'Algeria'] },
  'Gold':       { emoji: '🥇', producers: ['South Africa', 'Ghana', 'Tanzania', 'Mali'] },
  'Copper':     { emoji: '🔶', producers: ['Zambia', 'DRC', 'South Africa'] },
  'Cocoa':      { emoji: '🍫', producers: ["Côte d'Ivoire", 'Ghana', 'Cameroon'] },
  'Coffee':     { emoji: '☕', producers: ['Ethiopia', 'Uganda', 'Tanzania'] },
  'Platinum':   { emoji: '⚪', producers: ['South Africa', 'Zimbabwe'] },
  'Diamonds':   { emoji: '💎', producers: ['Botswana', 'Angola', 'South Africa'] },
  'Natural Gas':{ emoji: '🔥', producers: ['Nigeria', 'Algeria', 'Mozambique'] },
  'Cotton':     { emoji: '🌿', producers: ['Mali', 'Burkina Faso', 'Egypt'] },
}

function PctChange({ value }: { value: number }) {
  if (value > 0) return (
    <span className="text-[0.7rem] font-semibold text-[#1a6b3c]">▲ +{value.toFixed(2)}%</span>
  )
  if (value < 0) return (
    <span className="text-[0.7rem] font-semibold text-[#8b1a1a]">▼ {value.toFixed(2)}%</span>
  )
  return <span className="text-[0.7rem] text-ink/30">—</span>
}

export function CommodityWatch({ commodities, className }: Props) {
  if (!commodities || commodities.length === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 skeleton rounded-sm" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      {commodities.map((c) => {
        const meta = COMMODITY_META[c.commodity]
        return (
          <div
            key={c.commodity}
            className="py-2.5 border-b border-ink/8 last:border-0"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{meta?.emoji ?? '📊'}</span>
                <div>
                  <span
                    className="text-[0.8125rem] font-semibold text-ink"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {c.commodity}
                  </span>
                  {meta && (
                    <p
                      className="text-[0.6rem] text-ink/40 leading-none mt-0.5"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      {meta.producers.slice(0, 2).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-[0.8125rem] font-semibold text-ink tabular-nums"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  ${c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                  <span className="text-[0.6rem] text-ink/40 font-normal">/{c.unit}</span>
                </div>
                <PctChange value={c.change_pct} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
