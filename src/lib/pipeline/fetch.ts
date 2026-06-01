import Parser from 'rss-parser'
import axios from 'axios'

export interface RawArticle {
  title: string
  content: string
  url: string
  publishedAt: string
  source: string
}

const RSS_FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/AFRICANews', source: 'Reuters Africa' },
  { url: 'https://www.afdb.org/en/rss', source: 'AfDB' },
  { url: 'https://feeds.bbci.co.uk/news/business/africa/rss.xml', source: 'BBC Africa Business' },
  { url: 'https://www.businessdailyafrica.com/rss', source: 'Business Daily Africa' },
  { url: 'https://businesstech.co.za/news/feed/', source: 'BusinessTech SA' },
]

const AFRICA_KEYWORDS = [
  'africa', 'nigeria', 'kenya', 'ghana', 'ethiopia', 'south africa',
  'egypt', 'morocco', 'tanzania', 'uganda', 'senegal', "cote d'ivoire", 'ivory coast',
  'angola', 'mozambique', 'zambia', 'zimbabwe', 'rwanda', 'nairobi', 'lagos', 'accra',
  'johannesburg', 'cairo', 'ngx', 'nse', 'jse', 'gse', 'cbn', 'cbk', 'sarb',
  'naira', 'shilling', 'cedi', 'rand', 'birr', 'franc', 'fdi', 'afcfta',
]

function isAfricaRelevant(text: string): boolean {
  const lower = text.toLowerCase()
  return AFRICA_KEYWORDS.some(kw => lower.includes(kw))
}

export async function fetchRSSFeeds(): Promise<RawArticle[]> {
  const parser = new Parser()
  const articles: RawArticle[] = []

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url)
      for (const item of parsed.items) {
        const text = `${item.title || ''} ${item.contentSnippet || item.content || ''}`
        if (isAfricaRelevant(text)) {
          articles.push({
            title: item.title || '',
            content: item.contentSnippet || item.content || item.summary || '',
            url: item.link || '',
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            source: feed.source,
          })
        }
      }
    } catch (err) {
      console.error(`RSS fetch failed for ${feed.url}:`, err)
    }
  }

  return articles
}

export async function fetchNewsAPI(): Promise<RawArticle[]> {
  const key = process.env.NEWSAPI_KEY
  if (!key) return []

  try {
    const res = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'Africa finance investment economy',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 50,
        apiKey: key,
      },
    })
    return (res.data.articles || [])
      .map((a: {
        title: string
        description?: string
        content?: string
        url: string
        publishedAt: string
        source?: { name?: string }
      }) => ({
        title: a.title,
        content: a.description || a.content || '',
        url: a.url,
        publishedAt: a.publishedAt,
        source: a.source?.name || 'NewsAPI',
      }))
      .filter((a: RawArticle) => isAfricaRelevant(`${a.title} ${a.content}`))
  } catch (err) {
    console.error('NewsAPI fetch failed:', err)
    return []
  }
}

export async function fetchAllNews(): Promise<RawArticle[]> {
  const [rss, newsapi] = await Promise.all([fetchRSSFeeds(), fetchNewsAPI()])
  const all = [...rss, ...newsapi]

  // Deduplicate by URL
  const seen = new Set<string>()
  return all.filter(a => {
    if (!a.url || seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })
}
