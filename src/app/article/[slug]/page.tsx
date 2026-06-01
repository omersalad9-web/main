import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArticleBySlug, getLatestArticles } from '@/lib/db/queries'
import type { ArticleCard as ArticleCardType } from '@/types'
import ArticlePageClient from './_client'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug).catch(() => null)
  if (!article) return { title: 'Article Not Found' }
  return {
    title: article.headline,
    description: article.dek,
    openGraph: {
      title: article.headline,
      description: article.dek,
      type: 'article',
      publishedTime: article.published_at.toISOString(),
      authors: [article.byline],
    },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, related] = await Promise.all([
    getArticleBySlug(params.slug).catch(() => null),
    getLatestArticles(4).catch(() => [] as any[]),
  ])

  if (!article) notFound()

  const relatedCards: ArticleCardType[] = (related as any[])
    .filter((a: any) => a.slug !== article.slug)
    .slice(0, 3)
    .map((a: any) => ({ ...a, published_at: new Date(a.published_at) }))

  const serialised = {
    ...article,
    published_at: article.published_at.toISOString(),
    created_at: article.created_at.toISOString(),
    gainers: article.gainers as string[],
    losers: article.losers as string[],
    watchlist: article.watchlist as string[],
    source_urls: article.source_urls as string[],
  }

  return <ArticlePageClient article={serialised} related={relatedCards} />
}
