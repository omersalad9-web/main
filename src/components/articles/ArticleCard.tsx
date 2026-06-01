import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { MoveBadge } from '@/components/ui/MoveBadge'
import { formatRelativeTime } from '@/lib/utils'
import type { ArticleCard as ArticleCardType } from '@/types'

interface Props {
  article: ArticleCardType
  variant?: 'lead' | 'featured' | 'compact'
  className?: string
}

const COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria', KE: 'Kenya', GH: 'Ghana', ZA: 'South Africa',
  ET: 'Ethiopia', EG: 'Egypt', MA: 'Morocco', TZ: 'Tanzania',
  SN: 'Senegal', RW: 'Rwanda', AO: 'Angola', CI: "Côte d'Ivoire",
}

export function ArticleCard({ article, variant = 'featured', className }: Props) {
  const countryName = COUNTRY_NAMES[article.country] ?? article.country
  const relativeTime = formatRelativeTime(article.published_at)

  if (variant === 'lead') {
    return (
      <article className={cn('group', className)}>
        <Link href={`/article/${article.slug}`} className="block">
          {/* Kicker */}
          <div className="flex items-center gap-2 mb-3">
            <span className="kicker">{article.kicker}</span>
            <span className="text-ink/20 text-xs">·</span>
            <span className="country-pill">{countryName}</span>
          </div>

          {/* Headline */}
          <h2
            className="text-[2.5rem] sm:text-[3rem] font-bold leading-[1.08] tracking-[-0.02em] text-ink mb-4 group-hover:text-[#A07830] transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {article.headline}
          </h2>

          {/* Dek */}
          <p
            className="text-[1.125rem] leading-[1.6] text-ink/75 mb-4 drop-cap"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {article.dek}
          </p>

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <SignalBadge signal={article.signal} size="md" />
            <MoveBadge move={article.move} magnitude={article.magnitude} showMagnitude size="md" />
          </div>

          {/* Byline + meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="byline">{article.byline}</span>
            <span className="text-ink/25 text-xs">·</span>
            <span
              className="text-[0.6875rem] text-ink/45"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              {article.dateline}
            </span>
            <span className="text-ink/25 text-xs">·</span>
            <span
              className="text-[0.6875rem] text-ink/45"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              {article.read_time} min read
            </span>
            {article.is_premium && (
              <>
                <span className="text-ink/25 text-xs">·</span>
                <span
                  className="text-[0.6rem] font-semibold tracking-wider uppercase text-[#C9A84C]"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  🔒 Premium
                </span>
              </>
            )}
          </div>
        </Link>
      </article>
    )
  }

  if (variant === 'featured') {
    return (
      <article
        className={cn(
          'group border-t border-ink/10 pt-4 hover:bg-[#C9A84C]/3 -mx-2 px-2 rounded-sm transition-colors',
          className,
        )}
      >
        <Link href={`/article/${article.slug}`} className="block">
          {/* Kicker */}
          <div className="flex items-center gap-2 mb-2">
            <span className="kicker">{article.kicker}</span>
            <span className="text-ink/20 text-xs">·</span>
            <span className="country-pill">{countryName}</span>
          </div>

          {/* Headline */}
          <h3
            className="text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.01em] text-ink mb-2 group-hover:underline decoration-[#C9A84C] underline-offset-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {article.headline}
          </h3>

          {/* Dek */}
          <p
            className="text-[0.9375rem] leading-[1.55] text-ink/65 mb-3 line-clamp-2"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {article.dek}
          </p>

          {/* Badges + meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <SignalBadge signal={article.signal} size="sm" />
              <MoveBadge move={article.move} size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[0.65rem] text-ink/40"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {relativeTime}
              </span>
              <span
                className="text-[0.65rem] text-ink/40"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {article.read_time} min
              </span>
              {article.is_premium && (
                <span className="text-[0.6rem] text-[#C9A84C]">🔒</span>
              )}
            </div>
          </div>
        </Link>
      </article>
    )
  }

  // compact
  return (
    <article
      className={cn(
        'group flex items-start gap-3 border-t border-ink/8 pt-3 hover:bg-[#C9A84C]/3 -mx-2 px-2 rounded-sm transition-colors',
        className,
      )}
    >
      <Link href={`/article/${article.slug}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="kicker">{article.kicker}</span>
          <span className="country-pill">{countryName}</span>
        </div>
        <h4
          className="text-[1rem] font-semibold leading-[1.25] text-ink mb-1 group-hover:underline decoration-[#C9A84C] underline-offset-2 line-clamp-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {article.headline}
        </h4>
        <div className="flex items-center gap-1.5">
          <SignalBadge signal={article.signal} size="sm" />
          <MoveBadge move={article.move} size="sm" />
          <span
            className="text-[0.6rem] text-ink/40 ml-auto"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {relativeTime} · {article.read_time}m
            {article.is_premium && ' · 🔒'}
          </span>
        </div>
      </Link>
    </article>
  )
}
