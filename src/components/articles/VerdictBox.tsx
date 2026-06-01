import { cn } from '@/lib/utils'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { MoveBadge } from '@/components/ui/MoveBadge'
import type { ArticleSignal, ArticleMove } from '@/types'

interface Props {
  signal: ArticleSignal
  move: ArticleMove
  magnitude: number
  verdict: string
  gainers: string[]
  losers: string[]
  watchlist: string[]
  diasp_opp?: string | null
  className?: string
}

export function VerdictBox({
  signal,
  move,
  magnitude,
  verdict,
  gainers,
  losers,
  watchlist,
  diasp_opp,
  className,
}: Props) {
  const magSign = magnitude > 0 ? '+' : ''

  return (
    <aside
      className={cn(
        'bg-parchment border border-ink/10 border-l-[3px] border-l-[#C9A84C] rounded-sm p-5 my-8',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-ink/10">
        <h3
          className="text-[0.6rem] font-semibold tracking-[0.14em] uppercase text-[#C9A84C]"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          ❧ Investment Verdict
        </h3>
        <div className="flex items-center gap-2">
          <SignalBadge signal={signal} size="lg" />
          <MoveBadge move={move} magnitude={magnitude} showMagnitude size="md" />
        </div>
      </div>

      {/* Magnitude */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className={cn(
            'text-2xl font-bold',
            move === 'GAINER' ? 'text-[#1a6b3c]' : move === 'LOSER' ? 'text-[#8b1a1a]' : 'text-ink/60',
          )}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {magSign}{magnitude.toFixed(1)}%
        </span>
        <span
          className="text-[0.75rem] text-ink/50"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          Estimated Impact
        </span>
      </div>

      {/* Verdict text */}
      <p
        className="text-[0.9375rem] leading-[1.65] text-ink mb-5"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {verdict}
      </p>

      {/* Lists grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Gainers */}
        {gainers.length > 0 && (
          <div>
            <h4
              className="text-[0.6rem] font-semibold tracking-[0.1em] uppercase text-[#1a6b3c] mb-2"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              ▲ Gainers
            </h4>
            <ul className="space-y-1">
              {gainers.map((g) => (
                <li
                  key={g}
                  className="text-[0.8125rem] text-[#1a6b3c] font-medium"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Losers */}
        {losers.length > 0 && (
          <div>
            <h4
              className="text-[0.6rem] font-semibold tracking-[0.1em] uppercase text-[#8b1a1a] mb-2"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              ▼ Losers
            </h4>
            <ul className="space-y-1">
              {losers.map((l) => (
                <li
                  key={l}
                  className="text-[0.8125rem] text-[#8b1a1a] font-medium"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {l}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Watchlist */}
        {watchlist.length > 0 && (
          <div>
            <h4
              className="text-[0.6rem] font-semibold tracking-[0.1em] uppercase text-[#8b5a1a] mb-2"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              ◉ Watchlist
            </h4>
            <ul className="space-y-1">
              {watchlist.map((w) => (
                <li
                  key={w}
                  className="text-[0.8125rem] text-[#8b5a1a] font-medium"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Diaspora opportunity */}
      {diasp_opp && (
        <div className="border-l-2 border-[#C9A84C] pl-4 mt-4 pt-4 border-t border-t-ink/8">
          <p
            className="text-[0.6rem] font-semibold tracking-[0.1em] uppercase text-[#C9A84C] mb-1"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            ✦ Diaspora Opportunity
          </p>
          <p
            className="text-[0.875rem] italic leading-[1.6] text-ink/75"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {diasp_opp}
          </p>
        </div>
      )}
    </aside>
  )
}
