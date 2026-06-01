import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticlesBySector } from '@/lib/db/queries'
import { ArticleCard } from '@/components/articles/ArticleCard'
import type { ArticleCard as ArticleCardType } from '@/types'

export const revalidate = 900

const SECTOR_META: Record<string, { label: string; description: string; emoji: string }> = {
  banking:        { label: 'Banking & Finance', emoji: '🏦', description: 'Commercial banks, DFIs, fintech, and capital markets across Africa.' },
  telecoms:       { label: 'Telecoms & Mobile', emoji: '📡', description: 'Mobile network operators, data infrastructure, and digital payments.' },
  energy:         { label: 'Energy & Utilities', emoji: '⚡', description: 'Oil, gas, renewables, and power infrastructure.' },
  agriculture:    { label: 'Agriculture', emoji: '🌾', description: 'Staple crops, agribusiness, food processing, and supply chains.' },
  technology:     { label: 'Technology', emoji: '💻', description: 'Software, e-commerce, healthtech, and Africa\'s startup ecosystem.' },
  infrastructure: { label: 'Infrastructure', emoji: '🏗️', description: 'Roads, ports, airports, and logistics networks.' },
  mining:         { label: 'Mining & Resources', emoji: '⛏️', description: 'Gold, copper, platinum, diamonds, and critical minerals.' },
  retail:         { label: 'Retail & Consumer', emoji: '🛒', description: 'Fast-moving consumer goods, retail chains, and household spending.' },
  healthcare:     { label: 'Healthcare', emoji: '🏥', description: 'Hospitals, pharmaceuticals, and health insurance.' },
  real_estate:    { label: 'Real Estate', emoji: '🏢', description: 'Commercial property, REITs, and affordable housing.' },
}

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const meta = SECTOR_META[params.name.toLowerCase()]
  const label = meta?.label ?? params.name
  return {
    title: `${label} · Sector`,
    description: meta?.description ?? `Investment analysis for the ${label} sector across Africa.`,
  }
}

export default async function SectorPage({ params }: { params: { name: string } }) {
  const sectorKey = params.name.toLowerCase()
  const meta = SECTOR_META[sectorKey]

  // Build the display-friendly sector name for DB query
  // Articles store sector as title-case (e.g. "Banking", "Telecoms")
  const sectorLabel = meta?.label.split(' ')[0] ?? params.name

  const rawArticles = await getArticlesBySector(sectorLabel, 20).catch(() => [] as any[])
  const articles: ArticleCardType[] = rawArticles.map((a: any) => ({
    ...a,
    published_at: new Date(a.published_at),
  }))

  const [lead, ...rest] = articles
  const featured = rest.slice(0, 2)
  const compact = rest.slice(2)

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="mb-8 pb-6 border-b-2 border-ink">
          <div className="flex items-center gap-3 mb-2">
            {meta && <span className="text-4xl">{meta.emoji}</span>}
            <div>
              <p
                className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/40 mb-0.5"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                Sector Intelligence
              </p>
              <h1
                className="text-[2.75rem] font-bold tracking-[-0.02em] text-ink leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {meta?.label ?? params.name}
              </h1>
            </div>
          </div>
          {meta && (
            <p
              className="text-[0.9375rem] text-ink/55 mt-3 max-w-2xl"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {meta.description}
            </p>
          )}
        </div>

        {/* Articles */}
        {articles.length === 0 ? (
          <div className="py-16 text-center">
            <p
              className="text-2xl text-ink/20 font-bold mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No articles yet
            </p>
            <p className="text-[0.875rem] text-ink/40" style={{ fontFamily: 'var(--font-ui)' }}>
              Coverage for this sector will appear here as articles are published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
            <div className="space-y-8">
              {/* Lead */}
              {lead && (
                <div className="mb-8">
                  <ArticleCard article={lead} variant="lead" />
                </div>
              )}

              {/* Ornament */}
              {featured.length > 0 && (
                <div className="ornament-divider">
                  <span className="text-[#C9A84C] text-[0.7rem]">❧</span>
                </div>
              )}

              {/* Featured */}
              {featured.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {featured.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="featured" />
                  ))}
                </div>
              )}

              {/* Compact */}
              {compact.length > 0 && (
                <>
                  <div className="section-heading">More Coverage</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    {compact.map((a) => (
                      <ArticleCard key={a.id} article={a} variant="compact" className="mb-3" />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar: other sectors */}
            <aside>
              <div className="lg:sticky lg:top-4">
                <div className="section-heading">Other Sectors</div>
                <div className="space-y-1">
                  {Object.entries(SECTOR_META)
                    .filter(([k]) => k !== sectorKey)
                    .map(([k, s]) => (
                      <a
                        key={k}
                        href={`/sector/${k}`}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#C9A84C]/8 rounded-sm transition-colors group"
                      >
                        <span className="text-lg">{s.emoji}</span>
                        <span
                          className="text-[0.8125rem] text-ink/65 group-hover:text-[#C9A84C] transition-colors font-medium"
                          style={{ fontFamily: 'var(--font-ui)' }}
                        >
                          {s.label}
                        </span>
                      </a>
                    ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
