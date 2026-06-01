import Link from 'next/link'
import { getLatestArticles, getLatestMarketSnapshots, getLatestFXRates, getLatestCommodityPrices, getTodaysMoverCounts } from '@/lib/db/queries'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { ExchangeTable } from '@/components/markets/ExchangeTable'
import { FXRates } from '@/components/markets/FXRates'
import { CommodityWatch } from '@/components/markets/CommodityWatch'
import type { ArticleCard as ArticleCardType } from '@/types'

export const revalidate = 900

const REGIONS = ['All', 'West Africa', 'East Africa', 'Southern Africa', 'North Africa', 'Central Africa', 'Pan-Africa']
const SECTORS = ['Banking', 'Telecoms', 'Energy', 'Agriculture', 'Technology', 'Infrastructure', 'Mining']

interface PageProps {
  searchParams: { region?: string; sector?: string; move?: string }
}

export default async function HomePage({ searchParams }: PageProps) {
  const { region, sector, move } = searchParams

  const [rawArticles, snapshots, fxRates, commodities, moverCounts] = await Promise.all([
    getLatestArticles(12, {
      region: region && region !== 'All' ? region : undefined,
      sector: sector && sector !== 'All' ? sector : undefined,
      move: move as 'GAINER' | 'LOSER' | 'NEUTRAL' | undefined,
    }).catch(() => [] as any[]),
    getLatestMarketSnapshots().catch(() => []),
    getLatestFXRates().catch(() => []),
    getLatestCommodityPrices().catch(() => []),
    getTodaysMoverCounts().catch(() => ({ gainers: 0, losers: 0 })),
  ])

  // Map Prisma rows to ArticleCard type
  const articles: ArticleCardType[] = rawArticles.map((a: any) => ({
    ...a,
    published_at: new Date(a.published_at),
  }))

  const [lead, ...rest] = articles
  const featured = rest.slice(0, 2)
  const compact = rest.slice(2)

  const activeRegion = region ?? 'All'
  const activeSector = sector ?? ''

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div className="border-b border-ink/10 bg-parchment/60">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {REGIONS.map((r) => {
              const active = r === activeRegion
              return (
                <Link
                  key={r}
                  href={r === 'All' ? '/' : `/?region=${encodeURIComponent(r)}`}
                  className={`px-3 py-1.5 text-[0.625rem] font-semibold tracking-wider uppercase rounded-sm transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#C9A84C] text-white'
                      : 'text-ink/60 hover:text-[#C9A84C] hover:bg-[#C9A84C]/8'
                  }`}
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {r}
                </Link>
              )
            })}

            <span className="text-ink/20 mx-1">|</span>

            <span
              className="text-[0.625rem] font-semibold tracking-wider uppercase text-ink/40 mr-1"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Sector:
            </span>
            {SECTORS.map((s) => {
              const active = s === activeSector
              return (
                <Link
                  key={s}
                  href={`/?sector=${encodeURIComponent(s)}${region ? `&region=${encodeURIComponent(region)}` : ''}`}
                  className={`px-3 py-1.5 text-[0.625rem] font-semibold tracking-wider uppercase rounded-sm transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-ink text-cream'
                      : 'text-ink/60 hover:text-ink hover:bg-ink/8'
                  }`}
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {s}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-10">

          {/* ── Left / Center: articles ───────────────────────── */}
          <div className="min-w-0">

            {/* Lead article */}
            {lead ? (
              <div className="mb-8">
                <ArticleCard article={lead} variant="lead" />
              </div>
            ) : (
              <EmptyState />
            )}

            {/* Gold ornament divider */}
            <div className="ornament-divider mb-8">
              <span className="text-[#C9A84C] text-[0.7rem]">❧</span>
            </div>

            {/* Featured 2-up */}
            {featured.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {featured.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="featured" />
                ))}
              </div>
            )}

            {/* Section heading */}
            {compact.length > 0 && (
              <>
                <div className="section-heading mb-4">Latest Dispatches</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                  {compact.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="compact" className="mb-3" />
                  ))}
                </div>
              </>
            )}

            {articles.length === 0 && <EmptyState />}
          </div>

          {/* ── Sticky sidebar ────────────────────────────────── */}
          <aside className="space-y-6">
            <div className="lg:sticky lg:top-4 space-y-6">

              {/* Market Pulse */}
              <div className="bg-[#1a1a1a] text-[#FAFAF7] p-4 rounded-sm">
                <h2
                  className="text-[0.55rem] font-semibold tracking-[0.14em] uppercase text-[#C9A84C] mb-3"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  ◆ Market Pulse · Today
                </h2>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div
                      className="text-3xl font-bold text-[#4ade80]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {moverCounts.gainers}
                    </div>
                    <div
                      className="text-[0.55rem] tracking-[0.1em] uppercase text-[#4ade80]/70 mt-0.5"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      ▲ Gainers
                    </div>
                  </div>
                  <div className="flex-1 text-center text-[#C9A84C]/30 text-lg">·</div>
                  <div className="text-center">
                    <div
                      className="text-3xl font-bold text-[#f87171]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {moverCounts.losers}
                    </div>
                    <div
                      className="text-[0.55rem] tracking-[0.1em] uppercase text-[#f87171]/70 mt-0.5"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      ▼ Losers
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#C9A84C]/15">
                  <Link
                    href="/markets"
                    className="text-[0.6rem] tracking-wider uppercase text-[#C9A84C] hover:text-[#DEC07A] transition-colors"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    Full market data →
                  </Link>
                </div>
              </div>

              {/* Exchange Table */}
              <div>
                <div className="section-heading">African Exchanges</div>
                <ExchangeTable snapshots={snapshots} variant="compact" />
                <div className="mt-3 pt-2 border-t border-ink/8">
                  <Link
                    href="/markets"
                    className="text-[0.6rem] tracking-wider uppercase text-[#C9A84C] hover:text-[#A07830] transition-colors"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    All exchanges →
                  </Link>
                </div>
              </div>

              {/* FX Rates */}
              <div>
                <div className="section-heading">FX Rates</div>
                <FXRates rates={fxRates.slice(0, 8)} variant="grid" />
              </div>

              {/* Commodities */}
              <div>
                <div className="section-heading">Commodity Watch</div>
                <CommodityWatch commodities={commodities} />
              </div>

              {/* Subscribe CTA */}
              <div className="bg-parchment border border-[#C9A84C]/25 p-4 rounded-sm">
                <h3
                  className="text-[0.6rem] font-semibold tracking-[0.14em] uppercase text-[#C9A84C] mb-2"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  Diaspora Pro
                </h3>
                <p
                  className="text-[0.8125rem] italic leading-[1.5] text-ink/65 mb-3"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Unlock premium analysis, diaspora investment angles, and real-time alerts.
                </p>
                <Link
                  href="/subscribe"
                  className="block w-full text-center py-2 bg-[#C9A84C] text-white text-[0.625rem] font-semibold tracking-[0.1em] uppercase hover:bg-[#A07830] transition-colors"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  Subscribe from $29/mo
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <p
        className="text-2xl font-bold text-ink/20 mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        No articles yet
      </p>
      <p
        className="text-[0.875rem] text-ink/40"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        Run the pipeline to generate your first batch of articles.
      </p>
    </div>
  )
}
