import { Metadata } from 'next'
import { getLatestMarketSnapshots, getLatestFXRates, getLatestCommodityPrices, getLatestArticles } from '@/lib/db/queries'
import { ExchangeTable } from '@/components/markets/ExchangeTable'
import { FXRates } from '@/components/markets/FXRates'
import { CommodityWatch } from '@/components/markets/CommodityWatch'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { format } from 'date-fns'
import type { ArticleCard as ArticleCardType } from '@/types'

export const metadata: Metadata = {
  title: 'Markets',
  description: 'Live African market data: exchanges, FX rates, and commodity prices.',
}

export const revalidate = 900

export default async function MarketsPage() {
  const [snapshots, fxRates, commodities, rawMovers] = await Promise.all([
    getLatestMarketSnapshots().catch(() => []),
    getLatestFXRates().catch(() => []),
    getLatestCommodityPrices().catch(() => []),
    getLatestArticles(6, { move: 'GAINER' }).catch(() => [] as any[]),
  ])

  const topMovers: ArticleCardType[] = rawMovers.map((a: any) => ({
    ...a,
    published_at: new Date(a.published_at),
  }))

  const today = format(new Date(), "EEEE, d MMMM yyyy")

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page masthead */}
        <div className="mb-8 pb-6 border-b-2 border-ink">
          <p
            className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/40 mb-1"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {today}
          </p>
          <h1
            className="text-[3rem] font-bold tracking-[-0.02em] text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Markets
          </h1>
          <p
            className="text-[0.875rem] text-ink/55 mt-1"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Real-time performance across African exchanges, currencies, and commodities.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Exchange performance — full width on tablet, 2 cols on desktop */}
          <div className="lg:col-span-2 space-y-10">

            {/* Exchange table */}
            <section>
              <div className="section-heading">Exchange Performance</div>
              {snapshots.length === 0 ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 skeleton rounded-sm" />
                  ))}
                </div>
              ) : (
                <ExchangeTable snapshots={snapshots} variant="full" />
              )}
            </section>

            {/* FX Rates full table */}
            <section>
              <div className="section-heading">Foreign Exchange Rates</div>
              {fxRates.length === 0 ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 skeleton rounded-sm" />
                  ))}
                </div>
              ) : (
                <FXRates rates={fxRates} variant="table" />
              )}
            </section>

            {/* Top movers feed */}
            {topMovers.length > 0 && (
              <section>
                <div className="section-heading">Top Mover Coverage</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                  {topMovers.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="compact" className="mb-3" />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section>
              <div className="section-heading">Commodity Watch</div>
              <CommodityWatch commodities={commodities} />
            </section>

            {/* Data timestamp */}
            <div className="bg-parchment border border-ink/10 p-4 rounded-sm">
              <p
                className="text-[0.6rem] tracking-[0.1em] uppercase text-[#C9A84C] mb-1"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                Data Freshness
              </p>
              <p
                className="text-[0.8125rem] text-ink/60 leading-relaxed"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Market data refreshes every 15 minutes during trading hours.
                Exchange and FX data sourced from public market feeds.
              </p>
            </div>

            {/* Market hours note */}
            <div>
              <p
                className="text-[0.6rem] tracking-[0.1em] uppercase text-ink/40 mb-2"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                Trading Hours (Local)
              </p>
              <div className="space-y-1.5">
                {[
                  { exchange: 'NGX', hours: '10:00 – 14:30 WAT' },
                  { exchange: 'JSE', hours: '09:00 – 17:00 SAST' },
                  { exchange: 'NSE', hours: '09:30 – 15:00 EAT' },
                  { exchange: 'GSE', hours: '10:00 – 15:00 GMT' },
                  { exchange: 'EGX', hours: '10:00 – 14:30 EET' },
                ].map((e) => (
                  <div key={e.exchange} className="flex justify-between">
                    <span
                      className="text-[0.75rem] font-semibold text-ink/70"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      {e.exchange}
                    </span>
                    <span
                      className="text-[0.75rem] text-ink/45"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      {e.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
