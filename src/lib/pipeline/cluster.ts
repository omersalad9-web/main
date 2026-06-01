import type { RawArticle } from './fetch'

export interface ArticleCluster {
  articles: RawArticle[]
  primaryCountry: string
  primarySector: string
  theme: string
}

const COUNTRY_KEYWORDS: Record<string, string[]> = {
  'Nigeria': ['nigeria', 'nigerian', 'lagos', 'abuja', 'ngx', 'naira', 'cbn', 'zenith', 'gtbank', 'dangote'],
  'Kenya': ['kenya', 'kenyan', 'nairobi', 'nse', 'shilling', 'cbk', 'safaricom', 'equity bank', 'mpesa'],
  'Ghana': ['ghana', 'ghanaian', 'accra', 'gse', 'cedi', 'bog', 'cocobod'],
  'South Africa': ['south africa', 'johannesburg', 'jse', 'rand', 'sarb', 'eskom', 'sasol', 'anglo'],
  'Ethiopia': ['ethiopia', 'ethiopian', 'addis ababa', 'birr', 'nbe', 'ethio telecom'],
  'Egypt': ['egypt', 'egyptian', 'cairo', 'egx', 'pound', 'cbe'],
  'Morocco': ['morocco', 'moroccan', 'casablanca', 'dirham', 'bank al-maghrib'],
  'Tanzania': ['tanzania', 'tanzanian', 'dar es salaam', 'shilling', 'bot'],
  'Senegal': ['senegal', 'senegalese', 'dakar', 'franc cfa'],
  'Rwanda': ['rwanda', 'rwandan', 'kigali', 'franc', 'bnr'],
  'Angola': ['angola', 'angolan', 'luanda', 'kwanza', 'bna'],
  "Côte d'Ivoire": ["cote d'ivoire", 'ivory coast', 'abidjan', 'franc cfa'],
}

const SECTOR_KEYWORDS: Record<string, string[]> = {
  'Banking & Finance': ['bank', 'banking', 'fintech', 'credit', 'loan', 'interest rate', 'monetary policy', 'microfinance', 'payment'],
  'Energy': ['oil', 'gas', 'energy', 'power', 'electricity', 'renewable', 'solar', 'petroleum', 'lng', 'opec'],
  'Agriculture': ['agriculture', 'cocoa', 'coffee', 'maize', 'wheat', 'food', 'farming', 'crop', 'harvest'],
  'Technology': ['tech', 'technology', 'startup', 'digital', 'mobile money', 'e-commerce', 'telecoms', 'internet'],
  'Mining & Resources': ['mining', 'gold', 'copper', 'cobalt', 'lithium', 'iron ore', 'mineral', 'diamond', 'platinum'],
  'Real Estate': ['real estate', 'property', 'housing', 'construction', 'infrastructure', 'mortgage'],
  'Trade & Commerce': ['trade', 'export', 'import', 'afcfta', 'port', 'logistics', 'supply chain'],
  'Government & Policy': ['government', 'policy', 'regulation', 'central bank', 'budget', 'imf', 'world bank', 'debt'],
}

function detectCountry(text: string): string {
  const lower = text.toLowerCase()
  for (const [country, kws] of Object.entries(COUNTRY_KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) return country
  }
  return 'Africa'
}

function detectSector(text: string): string {
  const lower = text.toLowerCase()
  for (const [sector, kws] of Object.entries(SECTOR_KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) return sector
  }
  return 'Economics'
}

export function clusterArticles(articles: RawArticle[]): ArticleCluster[] {
  // Group by detected country + sector
  const clusters = new Map<string, RawArticle[]>()

  for (const article of articles) {
    const text = `${article.title} ${article.content}`
    const country = detectCountry(text)
    const sector = detectSector(text)
    const key = `${country}::${sector}`

    if (!clusters.has(key)) clusters.set(key, [])
    clusters.get(key)!.push(article)
  }

  const result: ArticleCluster[] = []
  for (const [key, arts] of clusters.entries()) {
    const [country, sector] = key.split('::')
    // Take max 5 per cluster to keep prompt sizes manageable
    const sliced = arts.slice(0, 5)
    result.push({
      articles: sliced,
      primaryCountry: country,
      primarySector: sector,
      theme: `${country} ${sector}`,
    })
  }

  // Sort by cluster size: larger clusters = more coverage = more important story
  return result.sort((a, b) => b.articles.length - a.articles.length)
}
