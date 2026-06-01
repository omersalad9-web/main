import { NextRequest, NextResponse } from 'next/server'
import { getLatestArticles } from '@/lib/db/queries'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const region  = searchParams.get('region')  ?? undefined
  const sector  = searchParams.get('sector')  ?? undefined
  const move    = searchParams.get('move')    ?? undefined
  const signal  = searchParams.get('signal')  ?? undefined
  const limit   = Math.min(parseInt(searchParams.get('limit')  ?? '20', 10), 100)
  const offset  = parseInt(searchParams.get('offset') ?? '0', 10)

  try {
    const articles = await getLatestArticles(limit + offset, {
      region:  region  as any,
      sector:  sector  as any,
      move:    move    as 'GAINER' | 'LOSER' | 'NEUTRAL' | undefined,
      signal:  signal  as 'BUY' | 'WATCH' | 'SELL' | 'HOLD' | undefined,
    })

    const paginated = articles.slice(offset)

    return NextResponse.json({
      success: true,
      data: paginated,
      meta: {
        limit,
        offset,
        count: paginated.length,
      },
    })
  } catch (err) {
    console.error('[GET /api/articles]', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 },
    )
  }
}
