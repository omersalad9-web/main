import { prisma } from './index'

// ─── Article Queries ──────────────────────────────────────────────────────────

export interface ArticleFilters {
  region?: string
  sector?: string
  move?: 'GAINER' | 'LOSER' | 'NEUTRAL'
  signal?: 'BUY' | 'WATCH' | 'SELL' | 'HOLD'
}

export async function getLatestArticles(limit = 20, filters: ArticleFilters = {}) {
  return prisma.article.findMany({
    where: {
      ...(filters.region ? { region: filters.region } : {}),
      ...(filters.sector ? { sector: filters.sector } : {}),
      ...(filters.move ? { move: filters.move } : {}),
      ...(filters.signal ? { signal: filters.signal } : {}),
    },
    orderBy: { published_at: 'desc' },
    take: limit,
  })
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
  })
}

export async function getArticlesByCountry(country: string, limit = 10) {
  return prisma.article.findMany({
    where: { country },
    orderBy: { published_at: 'desc' },
    take: limit,
  })
}

export async function getArticlesBySector(sector: string, limit = 10) {
  return prisma.article.findMany({
    where: { sector },
    orderBy: { published_at: 'desc' },
    take: limit,
  })
}

// ─── Market Data Queries ──────────────────────────────────────────────────────

export async function getLatestMarketSnapshots() {
  // Get the most recent snapshot per exchange using a raw groupBy approach
  const all = await prisma.marketSnapshot.findMany({
    orderBy: { fetched_at: 'desc' },
  })

  const seen = new Set<string>()
  const latest: typeof all = []
  for (const row of all) {
    if (!seen.has(row.exchange)) {
      seen.add(row.exchange)
      latest.push(row)
    }
  }
  return latest
}

export async function getLatestFXRates() {
  const all = await prisma.fXRate.findMany({
    orderBy: { fetched_at: 'desc' },
  })

  const seen = new Set<string>()
  const latest: typeof all = []
  for (const row of all) {
    if (!seen.has(row.pair)) {
      seen.add(row.pair)
      latest.push(row)
    }
  }
  return latest
}

export async function getLatestCommodityPrices() {
  const all = await prisma.commodityPrice.findMany({
    orderBy: { fetched_at: 'desc' },
  })

  const seen = new Set<string>()
  const latest: typeof all = []
  for (const row of all) {
    if (!seen.has(row.commodity)) {
      seen.add(row.commodity)
      latest.push(row)
    }
  }
  return latest
}

// ─── Mover Counts ─────────────────────────────────────────────────────────────

export async function getTodaysMoverCounts(): Promise<{ gainers: number; losers: number }> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [gainers, losers] = await Promise.all([
    prisma.article.count({
      where: { move: 'GAINER', published_at: { gte: startOfDay } },
    }),
    prisma.article.count({
      where: { move: 'LOSER', published_at: { gte: startOfDay } },
    }),
  ])

  return { gainers, losers }
}

// ─── Write Operations ─────────────────────────────────────────────────────────

export async function createArticle(data: Parameters<typeof prisma.article.create>[0]['data']) {
  return prisma.article.create({ data })
}

export async function upsertMarketSnapshot(data: {
  exchange: string
  country: string
  price: number
  change_pct: number
  volume: number
}) {
  return prisma.marketSnapshot.create({
    data: {
      id: crypto.randomUUID(),
      ...data,
      fetched_at: new Date(),
    },
  })
}

export async function upsertFXRate(data: {
  pair: string
  rate: number
  change_pct: number
}) {
  return prisma.fXRate.create({
    data: {
      ...data,
      fetched_at: new Date(),
    },
  })
}

export async function upsertCommodityPrice(data: {
  commodity: string
  price: number
  unit: string
  change_pct: number
}) {
  return prisma.commodityPrice.create({
    data: {
      ...data,
      fetched_at: new Date(),
    },
  })
}

// ─── User Queries ─────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function incrementArticlesRead(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { articles_read: { increment: 1 } },
  })
}

export async function createBookmark(userId: string, articleId: string) {
  return prisma.bookmark.create({
    data: {
      id: crypto.randomUUID(),
      user_id: userId,
      article_id: articleId,
      created_at: new Date(),
    },
  })
}

export async function removeBookmark(userId: string, articleId: string) {
  return prisma.bookmark.deleteMany({
    where: { user_id: userId, article_id: articleId },
  })
}

export async function getUserBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { user_id: userId },
    include: { article: true },
    orderBy: { created_at: 'desc' },
  })
}
