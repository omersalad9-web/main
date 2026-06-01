'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { VerdictBox } from '@/components/articles/VerdictBox'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { SignalBadge } from '@/components/ui/SignalBadge'
import { MoveBadge } from '@/components/ui/MoveBadge'
import { formatDate } from '@/lib/utils'
import type { ArticleCard as ArticleCardType, ArticleSignal, ArticleMove } from '@/types'

interface SerializedArticle {
  id: string
  slug: string
  kicker: string
  headline: string
  dek: string
  byline: string
  dateline: string
  body: string
  country: string
  region: string
  sector: string
  move: ArticleMove
  signal: ArticleSignal
  magnitude: number
  verdict: string
  gainers: string[]
  losers: string[]
  watchlist: string[]
  diasp_opp: string | null
  pull_quote: string | null
  read_time: number
  source_urls: string[]
  published_at: string
  created_at: string
  is_premium: boolean
}

interface Props {
  article: SerializedArticle
  related: ArticleCardType[]
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="reading-progress"
      style={{ width: `${progress}%` }}
    />
  )
}

// Split body into paragraphs for rendering
function ArticleBody({ body, pullQuote }: { body: string; pullQuote: string | null }) {
  const paragraphs = body.split('\n\n').filter(Boolean)
  const pullQuoteIndex = Math.floor(paragraphs.length / 2)

  return (
    <div className="article-body">
      {paragraphs.map((para, i) => (
        <>
          {pullQuote && i === pullQuoteIndex && (
            <blockquote key={`pq-${i}`} className="pull-quote">
              {pullQuote}
            </blockquote>
          )}
          <p
            key={i}
            className={i === 0 ? 'drop-cap' : ''}
          >
            {para}
          </p>
        </>
      ))}
    </div>
  )
}

export default function ArticlePageClient({ article, related }: Props) {
  const [bookmarked, setBookmarked] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    } catch {
      // ignore
    }
  }

  const publishedDate = new Date(article.published_at)

  return (
    <>
      <ReadingProgress />

      <div className="bg-cream min-h-screen">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-10">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-wider uppercase text-ink/40 hover:text-[#C9A84C] transition-colors mb-8"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            ← Back to Front Page
          </Link>

          {/* Kicker */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="kicker">{article.kicker}</span>
            <span className="text-ink/20">·</span>
            <span className="country-pill">{article.region}</span>
            <span className="text-ink/20">·</span>
            <span
              className="text-[0.6rem] tracking-wider text-ink/40 uppercase"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              {article.sector}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-[2.5rem] sm:text-[3.25rem] font-bold leading-[1.05] tracking-[-0.02em] text-ink mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {article.headline}
          </h1>

          {/* Dek */}
          <p
            className="text-[1.1875rem] leading-[1.6] text-ink/75 mb-6 font-body"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {article.dek}
          </p>

          {/* Signal badges */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <SignalBadge signal={article.signal} size="md" />
            <MoveBadge move={article.move} magnitude={article.magnitude} showMagnitude size="md" />
          </div>

          {/* Byline / meta bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-[0.75rem] font-semibold text-ink tracking-[0.03em]"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {article.byline}
              </span>
              <span className="text-ink/25">·</span>
              <span
                className="text-[0.75rem] text-ink/55"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {article.dateline}
              </span>
              <span className="text-ink/25">·</span>
              <span
                className="text-[0.75rem] text-ink/45"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {formatDate(publishedDate)}
              </span>
              <span className="text-ink/25">·</span>
              <span
                className="text-[0.75rem] text-ink/45"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {article.read_time} min read
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-ink/15 text-[0.625rem] font-semibold tracking-wider uppercase text-ink/50 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors rounded-sm"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {shareSuccess ? '✓ Copied' : '⎋ Share'}
              </button>
              <button
                onClick={() => setBookmarked((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border text-[0.625rem] font-semibold tracking-wider uppercase rounded-sm transition-colors ${
                  bookmarked
                    ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]'
                    : 'border-ink/15 text-ink/50 hover:border-[#C9A84C] hover:text-[#C9A84C]'
                }`}
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {bookmarked ? '★ Saved' : '☆ Save'}
              </button>
            </div>
          </div>

          {/* Gold rule */}
          <hr className="gold-rule-thick" />

          {/* Article body */}
          <div className="mt-8 mb-8">
            <ArticleBody body={article.body} pullQuote={article.pull_quote} />
          </div>

          {/* Verdict box */}
          <VerdictBox
            signal={article.signal}
            move={article.move}
            magnitude={article.magnitude}
            verdict={article.verdict}
            gainers={article.gainers}
            losers={article.losers}
            watchlist={article.watchlist}
            diasp_opp={article.diasp_opp}
          />

          {/* Source line */}
          {article.source_urls && article.source_urls.length > 0 && (
            <div className="mt-4 mb-8">
              <p
                className="text-[0.6rem] tracking-[0.08em] uppercase text-ink/30 mb-1"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                Sources
              </p>
              <div className="flex flex-col gap-1">
                {(article.source_urls as string[]).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.75rem] text-[#C9A84C] hover:underline break-all"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Related articles */}
          {related.length > 0 && (
            <section className="mt-10 pt-8 border-t-2 border-ink">
              <div className="section-heading mb-6">Related Dispatches</div>
              <div className="space-y-0">
                {related.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="featured" className="mb-4" />
                ))}
              </div>
            </section>
          )}

          {/* Back link bottom */}
          <div className="mt-12 pt-6 border-t border-ink/10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[0.6875rem] tracking-wider uppercase text-ink/40 hover:text-[#C9A84C] transition-colors"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              ← Return to Front Page
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
