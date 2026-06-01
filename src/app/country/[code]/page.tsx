import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticlesByCountry } from '@/lib/db/queries'
import { ArticleCard } from '@/components/articles/ArticleCard'
import type { ArticleCard as ArticleCardType } from '@/types'

export const revalidate = 3600

const COUNTRIES: Record<string, {
  name: string
  flag: string
  region: string
  rating: 'OVERWEIGHT' | 'NEUTRAL' | 'UNDERWEIGHT'
  gdp: string
  inflation: string
  fxYTD: string
  exchangeReturn: string
  keyRisk: string
  riskScore: number // 0-100, higher = more risk
  exchange: string
  currency: string
  brief: string
}> = {
  NG: {
    name: 'Nigeria', flag: '🇳🇬', region: 'West Africa', rating: 'OVERWEIGHT',
    gdp: '$477B', inflation: '28.9%', fxYTD: '-12.4%', exchangeReturn: '+18.2%',
    keyRisk: 'Naira volatility & fuel subsidy reform',
    riskScore: 62,
    exchange: 'NGX', currency: 'NGN',
    brief: 'Nigeria remains Sub-Saharan Africa\'s largest economy by nominal GDP. The removal of fuel subsidies and exchange rate unification under the Tinubu administration have created both short-term pain and medium-term opportunity. The NGX All-Share Index has outperformed peers in local currency terms, though dollar-denominated returns remain pressured by naira depreciation. The banking sector recapitalisation exercise presents selective opportunities.',
  },
  KE: {
    name: 'Kenya', flag: '🇰🇪', region: 'East Africa', rating: 'NEUTRAL',
    gdp: '$118B', inflation: '6.2%', fxYTD: '-3.1%', exchangeReturn: '+4.8%',
    keyRisk: 'Fiscal deficit & Eurobond refinancing',
    riskScore: 48,
    exchange: 'NSE', currency: 'KES',
    brief: 'Kenya\'s economy has shown resilience underpinned by a diversified base in technology, agriculture, and financial services. The NSE 20 has stabilised following a difficult 2023. Fiscal pressures remain elevated following youth-led protests against tax hikes, and the government\'s ability to manage debt obligations will be a key watchpoint through 2026.',
  },
  GH: {
    name: 'Ghana', flag: '🇬🇭', region: 'West Africa', rating: 'NEUTRAL',
    gdp: '$76B', inflation: '22.1%', fxYTD: '-5.8%', exchangeReturn: '+28.1%',
    keyRisk: 'Post-IMF restructuring execution risk',
    riskScore: 55,
    exchange: 'GSE', currency: 'GHS',
    brief: 'Ghana is navigating the most significant debt restructuring in its modern history, with IMF support providing a credible anchor. The GSE Composite Index has surged in local currency as inflation begins to moderate. Gold output recovery and cocoa price tailwinds provide near-term export uplift. Domestic bond market access is gradually returning.',
  },
  ZA: {
    name: 'South Africa', flag: '🇿🇦', region: 'Southern Africa', rating: 'NEUTRAL',
    gdp: '$399B', inflation: '5.3%', fxYTD: '+2.1%', exchangeReturn: '+8.9%',
    keyRisk: 'Load-shedding & structural reform pace',
    riskScore: 45,
    exchange: 'JSE', currency: 'ZAR',
    brief: 'South Africa\'s Government of National Unity has raised investor expectations around reform, but structural challenges — unemployment, energy insecurity, and logistics constraints — persist. The JSE remains the continent\'s deepest and most liquid market. The rand has partially stabilised, and the SARB\'s credible inflation targeting provides monetary policy confidence.',
  },
  ET: {
    name: 'Ethiopia', flag: '🇪🇹', region: 'East Africa', rating: 'UNDERWEIGHT',
    gdp: '$156B', inflation: '31.5%', fxYTD: '-18.2%', exchangeReturn: 'N/A',
    keyRisk: 'Post-conflict reconstruction & currency reform',
    riskScore: 78,
    exchange: 'ESX', currency: 'ETB',
    brief: 'Ethiopia is in the early stages of post-conflict reconstruction following the Tigray war. The new Ethiopian Securities Exchange launched in 2024, providing a nascent vehicle for equity investment. IMF-supported forex liberalisation has caused significant birr devaluation — presenting both risk and long-term opportunity for patient capital.',
  },
  EG: {
    name: 'Egypt', flag: '🇪🇬', region: 'North Africa', rating: 'OVERWEIGHT',
    gdp: '$393B', inflation: '26.4%', fxYTD: '-38.2%', exchangeReturn: '+65.3%',
    keyRisk: 'FX liberalisation & USD liquidity',
    riskScore: 58,
    exchange: 'EGX', currency: 'EGP',
    brief: 'Egypt\'s managed float devaluation and IMF programme have unlocked substantial GCC investment and restored some foreign exchange liquidity. The EGX 30 has delivered exceptional local-currency returns as investors position ahead of recovery. Tourism revenues and Suez Canal receipts provide near-term support, while structural reforms to the state-owned enterprise sector remain the medium-term catalyst.',
  },
  MA: {
    name: 'Morocco', flag: '🇲🇦', region: 'North Africa', rating: 'OVERWEIGHT',
    gdp: '$141B', inflation: '4.2%', fxYTD: '+0.4%', exchangeReturn: '+6.8%',
    keyRisk: 'Drought impact on agriculture',
    riskScore: 32,
    exchange: 'MASI (Casablanca)', currency: 'MAD',
    brief: 'Morocco stands out as one of Africa\'s most investment-friendly environments, with a stable currency, improving infrastructure, and positioning as a nearshore manufacturing hub for Europe. The 2030 FIFA World Cup co-hosting rights and Atlantic Coast port expansion are multi-year investment catalysts. The banking sector is well-capitalised with pan-African expansion ambitions.',
  },
  TZ: {
    name: 'Tanzania', flag: '🇹🇿', region: 'East Africa', rating: 'NEUTRAL',
    gdp: '$75B', inflation: '3.8%', fxYTD: '-4.2%', exchangeReturn: '+3.1%',
    keyRisk: 'Business environment & FDI restrictions',
    riskScore: 42,
    exchange: 'DSE', currency: 'TZS',
    brief: 'Tanzania offers stable macro fundamentals with one of East Africa\'s lowest inflation rates. LNG project development remains a long-term catalyst. The business environment has improved since the Samia administration eased FDI restrictions.',
  },
  SN: {
    name: 'Senegal', flag: '🇸🇳', region: 'West Africa', rating: 'OVERWEIGHT',
    gdp: '$28B', inflation: '5.1%', fxYTD: '0%', exchangeReturn: '+4.4%',
    keyRisk: 'Political transition & oil/gas ramp-up execution',
    riskScore: 38,
    exchange: 'BRVM', currency: 'XOF',
    brief: 'Senegal is on the cusp of an oil and gas production ramp-up that could structurally transform government revenues. The stable CFA franc peg provides FX certainty for diaspora remittances and investors. BRVM exposure provides access to the broader UEMOA economic zone.',
  },
  RW: {
    name: 'Rwanda', flag: '🇷🇼', region: 'East Africa', rating: 'OVERWEIGHT',
    gdp: '$14B', inflation: '4.9%', fxYTD: '-5.6%', exchangeReturn: '+7.2%',
    keyRisk: 'Regional security & DRC relations',
    riskScore: 35,
    exchange: 'RSE', currency: 'RWF',
    brief: 'Rwanda continues to punch above its weight as a destination for foreign direct investment, driven by governance quality, digital infrastructure ambitions, and Kigali\'s emergence as a regional financial hub. The RSE is nascent but growing. Key risks centre on regional security dynamics.',
  },
  AO: {
    name: 'Angola', flag: '🇦🇴', region: 'Central Africa', rating: 'NEUTRAL',
    gdp: '$103B', inflation: '25.7%', fxYTD: '-14.3%', exchangeReturn: '+12.1%',
    keyRisk: 'Oil dependency & kwanza volatility',
    riskScore: 65,
    exchange: 'BODIVA', currency: 'AOA',
    brief: 'Angola\'s economy remains heavily exposed to oil price cycles, with Sonangol dividends funding a large share of government spending. Reform efforts under President Lourenço have attracted some FDI outside the oil sector. The nascent BODIVA exchange is developing, though liquidity remains limited.',
  },
  CI: {
    name: "Côte d'Ivoire", flag: '🇨🇮', region: 'West Africa', rating: 'OVERWEIGHT',
    gdp: '$70B', inflation: '4.3%', fxYTD: '0%', exchangeReturn: '+5.9%',
    keyRisk: 'Cocoa price volatility & succession uncertainty',
    riskScore: 36,
    exchange: 'BRVM', currency: 'XOF',
    brief: "Côte d'Ivoire is the world's largest cocoa producer and one of West Africa's fastest-growing economies. Strong FDI inflows, port expansion, and energy sector development underpin the growth story. The BRVM listing gives investors access to a diversified West African equity universe with CFA franc stability.",
  },
}

export async function generateStaticParams() {
  return Object.keys(COUNTRIES).map((code) => ({ code }))
}

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const country = COUNTRIES[params.code.toUpperCase()]
  if (!country) return { title: 'Country Not Found' }
  return {
    title: `${country.name} · Country Profile`,
    description: `Investment profile for ${country.name}: ratings, macro data, and market analysis.`,
  }
}

const RATING_STYLES = {
  OVERWEIGHT: { classes: 'bg-emerald-950 text-emerald-400 border-emerald-700', label: 'OVERWEIGHT ▲' },
  NEUTRAL:    { classes: 'bg-blue-950 text-blue-400 border-blue-700', label: 'NEUTRAL —' },
  UNDERWEIGHT:{ classes: 'bg-red-950 text-red-400 border-red-700', label: 'UNDERWEIGHT ▼' },
}

export default async function CountryPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()
  const country = COUNTRIES[code]
  if (!country) notFound()

  const rawArticles = await getArticlesByCountry(code, 12).catch(() => [] as any[])
  const articles: ArticleCardType[] = rawArticles.map((a: any) => ({
    ...a,
    published_at: new Date(a.published_at),
  }))

  const ratingStyle = RATING_STYLES[country.rating]

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Hero */}
        <div className="mb-8 pb-6 border-b-2 border-ink">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-5xl">{country.flag}</span>
                <div>
                  <p
                    className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/40 mb-0.5"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {country.region} · {country.exchange}
                  </p>
                  <h1
                    className="text-[3rem] font-bold tracking-[-0.02em] text-ink leading-none"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {country.name}
                  </h1>
                </div>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-4 py-2 text-sm font-semibold tracking-[0.08em] uppercase border rounded-sm ${ratingStyle.classes}`}
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              {ratingStyle.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

          {/* Main column */}
          <div className="space-y-8">

            {/* Macro metrics grid */}
            <section>
              <div className="section-heading">Macro Snapshot</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'GDP', value: country.gdp },
                  { label: 'Inflation', value: country.inflation },
                  { label: 'FX YTD', value: country.fxYTD },
                  { label: 'Exchange Return', value: country.exchangeReturn },
                  { label: 'Key Risk', value: country.keyRisk, wide: true },
                ].map((m) => (
                  <div
                    key={m.label}
                    className={`bg-parchment border border-ink/10 p-3 rounded-sm ${m.wide ? 'sm:col-span-2 lg:col-span-2' : ''}`}
                  >
                    <p
                      className="text-[0.6rem] tracking-[0.1em] uppercase text-[#C9A84C] mb-1"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      {m.label}
                    </p>
                    <p
                      className="text-[1rem] font-semibold text-ink leading-tight"
                      style={{ fontFamily: m.label === 'Key Risk' ? 'var(--font-body)' : 'var(--font-display)' }}
                    >
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Country brief */}
            <section>
              <div className="section-heading">AFR Country Brief</div>
              <div className="bg-parchment border-l-[3px] border-[#C9A84C] pl-5 pr-4 py-4">
                <p
                  className="text-[1rem] leading-[1.75] text-ink"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {country.brief}
                </p>
              </div>
            </section>

            {/* Articles */}
            {articles.length > 0 && (
              <section>
                <div className="section-heading">{country.name} Coverage</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                  {articles.map((a, i) => (
                    <ArticleCard
                      key={a.id}
                      article={a}
                      variant={i === 0 ? 'featured' : 'compact'}
                      className="mb-4"
                    />
                  ))}
                </div>
              </section>
            )}

            {articles.length === 0 && (
              <div className="py-8 text-center text-ink/40">
                <p style={{ fontFamily: 'var(--font-body)' }}>No articles for {country.name} yet.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="lg:sticky lg:top-4 space-y-6">

              {/* Risk score */}
              <div className="bg-parchment border border-ink/10 p-4 rounded-sm">
                <p
                  className="text-[0.6rem] tracking-[0.1em] uppercase text-[#C9A84C] mb-3"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  Political Risk Score
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-2xl font-bold text-ink"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {country.riskScore}
                  </span>
                  <span
                    className="text-[0.6rem] text-ink/40 tracking-wider uppercase"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    /100
                  </span>
                </div>
                {/* Risk bar */}
                <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      country.riskScore < 40 ? 'bg-[#1a6b3c]' :
                      country.riskScore < 65 ? 'bg-[#C9A84C]' : 'bg-[#8b1a1a]'
                    }`}
                    style={{ width: `${country.riskScore}%` }}
                  />
                </div>
                <p
                  className="text-[0.65rem] text-ink/40 mt-2"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {country.riskScore < 40 ? 'Low risk' : country.riskScore < 65 ? 'Moderate risk' : 'Elevated risk'}
                  {' '}· Higher = more risk
                </p>
              </div>

              {/* Quick facts */}
              <div>
                <p
                  className="text-[0.6rem] tracking-[0.1em] uppercase text-[#C9A84C] mb-3 border-b border-[#C9A84C]/20 pb-2"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  Quick Facts
                </p>
                {[
                  { label: 'Exchange', value: country.exchange },
                  { label: 'Currency', value: country.currency },
                  { label: 'Region', value: country.region },
                  { label: 'AFR Rating', value: country.rating },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between py-2 border-b border-ink/8 last:border-0">
                    <span
                      className="text-[0.75rem] text-ink/50"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      {f.label}
                    </span>
                    <span
                      className="text-[0.75rem] font-semibold text-ink"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Other countries */}
              <div>
                <p
                  className="text-[0.6rem] tracking-[0.1em] uppercase text-[#C9A84C] mb-3 border-b border-[#C9A84C]/20 pb-2"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  Other Markets
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(COUNTRIES)
                    .filter(([c]) => c !== code)
                    .slice(0, 9)
                    .map(([c, d]) => (
                      <a
                        key={c}
                        href={`/country/${c}`}
                        className="flex flex-col items-center p-2 bg-parchment/60 hover:bg-[#C9A84C]/10 rounded-sm transition-colors text-center"
                      >
                        <span className="text-xl mb-0.5">{d.flag}</span>
                        <span
                          className="text-[0.55rem] font-semibold tracking-wide text-ink/60"
                          style={{ fontFamily: 'var(--font-ui)' }}
                        >
                          {c}
                        </span>
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
