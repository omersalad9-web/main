import { NextResponse } from 'next/server'
import { getLatestMarketSnapshots, getLatestFXRates, getLatestCommodityPrices } from '@/lib/db/queries'

interface TickerItem {
  label: string
  value: string
  change: number
}

export async function GET() {
  try {
    const [snapshots, fxRates, commodities] = await Promise.all([
      getLatestMarketSnapshots(),
      getLatestFXRates(),
      getLatestCommodityPrices(),
    ])

    const items: TickerItem[] = []

    // Exchange snapshots
    for (const s of snapshots) {
      const sign = s.change_pct >= 0 ? '+' : ''
      items.push({
        label: s.exchange,
        value: `${sign}${s.change_pct.toFixed(2)}%`,
        change: s.change_pct,
      })
    }

    // FX rates (show key pairs)
    const KEY_PAIRS = ['USD/NGN', 'USD/KES', 'USD/GHS', 'USD/ZAR', 'USD/EGP', 'USD/MAD']
    for (const r of fxRates) {
      if (KEY_PAIRS.includes(r.pair)) {
        items.push({
          label: r.pair,
          value: r.rate.toLocaleString('en-US', { maximumFractionDigits: 2 }),
          change: r.change_pct,
        })
      }
    }

    // Commodities
    for (const c of commodities) {
      const sign = c.change_pct >= 0 ? '+' : ''
      items.push({
        label: c.commodity.toUpperCase(),
        value: `${sign}${c.change_pct.toFixed(2)}%`,
        change: c.change_pct,
      })
    }

    // If no data, return fallback so the ticker is never empty
    if (items.length === 0) {
      items.push(
        { label: 'NGX',      value: '+1.24%',   change:  1.24 },
        { label: 'JSE',      value: '+0.67%',   change:  0.67 },
        { label: 'GSE',      value: '+2.11%',   change:  2.11 },
        { label: 'NSE',      value: '-0.38%',   change: -0.38 },
        { label: 'USD/NGN',  value: '1,612.00', change:  0    },
        { label: 'USD/KES',  value: '129.50',   change:  0    },
        { label: 'GOLD',     value: '+0.78%',   change:  0.78 },
        { label: 'CRUDE OIL',value: '-0.45%',   change: -0.45 },
      )
    }

    return NextResponse.json(
      { items },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      },
    )
  } catch (err) {
    console.error('[GET /api/market/ticker]', err)
    // Return fallback data on error so the ticker always works
    return NextResponse.json(
      {
        items: [
          { label: 'NGX',       value: '+1.24%',   change:  1.24 },
          { label: 'JSE',       value: '+0.67%',   change:  0.67 },
          { label: 'GSE',       value: '+2.11%',   change:  2.11 },
          { label: 'USD/NGN',   value: '1,612.00', change:  0    },
          { label: 'GOLD',      value: '+0.78%',   change:  0.78 },
          { label: 'CRUDE OIL', value: '-0.45%',   change: -0.45 },
        ],
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60' } },
    )
  }
}
