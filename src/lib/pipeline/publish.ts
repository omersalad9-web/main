import { prisma } from '../db'
import { generateArticle } from '../ai/claude'
import type { ArticleCluster } from './cluster'
import slugify from 'slugify'

export async function publishCluster(cluster: ArticleCluster): Promise<string | null> {
  try {
    const sources = cluster.articles.map(a => ({
      title: a.title,
      content: a.content,
      url: a.url,
      publishedAt: a.publishedAt,
    }))

    const articleData = await generateArticle(sources)

    const baseSlug = slugify(articleData.headline, { lower: true, strict: true })
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    const article = await prisma.article.create({
      data: {
        id: crypto.randomUUID(),
        slug,
        kicker: articleData.kicker,
        headline: articleData.headline,
        dek: articleData.dek,
        byline: articleData.byline,
        dateline: articleData.dateline,
        body: articleData.body,
        country: articleData.country,
        region: articleData.region,
        sector: articleData.sector,
        move: articleData.move,
        signal: articleData.signal,
        magnitude: articleData.magnitude,
        verdict: articleData.verdict,
        gainers: articleData.gainers,
        losers: articleData.losers,
        watchlist: articleData.watchlist,
        diasp_opp: articleData.diasp_opp,
        pull_quote: articleData.pull_quote,
        read_time: articleData.read_time,
        source_urls: cluster.articles.map(a => a.url),
        published_at: new Date(),
        is_premium: articleData.is_premium,
      },
    })

    return article.id
  } catch (err) {
    console.error('Failed to publish cluster:', err)
    return null
  }
}
