import axios from 'axios'
import { prisma } from '../db'

export interface ExchangeData {
  exchange: string
  country: string
  symbol: string
  price: number
  change_pct: number
  volume: number
}

const ALPHA_VANTAGE_SYMBOLS = [
  { symbol: 'DANGCEM.LG', exchange: 'NGX', country: 'Nigeria' },
  { symbol: 'SAFCOM.NR', exchange: 'NSE', country: 'Kenya' },
  { symbol: 'GGBL.GH', exchange: 'GSE', country: 'Ghana' },
  { symbol: 'SOL.JO', exchange: 'JSE', country: 'South Africa' },
]

export async function fetchExchangeData(): Promise<ExchangeData[]> {
  const key = process.env.ALPHA_VANTAGE_KEY
  if (!key) return getMockExchangeData()

  const results: ExchangeData[] = []
  for (const { symbol, exchange, country } of ALPHA_VANTAGE_SYMBOLS) {
    try {
      const res = await axios.get('https://www.alphavantage.co/query', {
        params: { function: 'GLOBAL_QUOTE', symbol, apikey: key },
      })
      const quote = res.data['Global Quote']
      if (quote && quote['05. price']) {
        results.push({
          exchange,
          country,
          symbol,
          price: parseFloat(quote['05. price']),
          change_pct: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
          volume: parseInt(quote['06. volume'] || '0', 10),
        })
      }
    } catch (err) {
      console.error(`Exchange data failed for ${symbol}:`, err)
    }
  }
  return results.length > 0 ? results : getMockExchangeData()
}

export async function fetchFXRates(): Promise<{ pair: string; rate: number; change_pct: number }[]> {
  const key = process.env.EXCHANGE_RATE_API_KEY
  if (!key) return getMockFXRates()

  try {
    const res = await axios.get(`https://v6.exchangerate-api.com/v6/${key}/latest/USD`)
    const rates = res.data.conversion_rates
    const pairs = [
      { pair: 'USD/NGN', code: 'NGN' },
      { pair: 'USD/KES', code: 'KES' },
      { pair: 'USD/GHS', code: 'GHS' },
      { pair: 'USD/ZAR', code: 'ZAR' },
      { pair: 'USD/ETB', code: 'ETB' },
      { pair: 'USD/EGP', code: 'EGP' },
      { pair: 'USD/MAD', code: 'MAD' },
    ]
    return pairs.map(p => ({
      pair: p.pair,
      rate: rates[p.code] || 0,
      // A real implementation would diff against yesterday's rate from a stored snapshot.
      // For now we surface a placeholder; consumers should override with historical data.
      change_pct: 0,
    }))
  } catch (err) {
    console.error('FX rates fetch failed:', err)
    return getMockFXRates()
  }
}

function getMockExchangeData(): ExchangeData[] {
  return [
    { exchange: 'NGX', country: 'Nigeria', symbol: 'NGXALL', price: 98450, change_pct: 1.24, volume: 458000000 },
    { exchange: 'NSE', country: 'Kenya', symbol: 'NSE20', price: 1842, change_pct: -0.38, volume: 12400000 },
    { exchange: 'JSE', country: 'South Africa', symbol: 'JTOPI', price: 81230, change_pct: 0.67, volume: 2100000000 },
    { exchange: 'GSE', country: 'Ghana', symbol: 'GSECI', price: 3941, change_pct: 2.11, volume: 5200000 },
    { exchange: 'EGX', country: 'Egypt', symbol: 'EGX30', price: 31450, change_pct: -1.02, volume: 890000000 },
    { exchange: 'BRVM', country: 'West Africa', symbol: 'BRVMC', price: 215, change_pct: 0.93, volume: 3100000 },
  ]
}

function getMockFXRates() {
  return [
    { pair: 'USD/NGN', rate: 1612, change_pct: 0.23 },
    { pair: 'USD/KES', rate: 129.5, change_pct: -0.41 },
    { pair: 'USD/GHS', rate: 15.8, change_pct: 1.12 },
    { pair: 'USD/ZAR', rate: 18.94, change_pct: -0.88 },
    { pair: 'USD/ETB', rate: 123.7, change_pct: 0.15 },
    { pair: 'USD/EGP', rate: 48.9, change_pct: -0.33 },
    { pair: 'USD/MAD', rate: 9.87, change_pct: 0.07 },
  ]
}

export async function saveMarketData() {
  const [exchanges, fxRates] = await Promise.all([fetchExchangeData(), fetchFXRates()])

  for (const ex of exchanges) {
    await prisma.marketSnapshot.create({
      data: {
        id: crypto.randomUUID(),
        exchange: ex.exchange,
        country: ex.country,
        price: ex.price,
        change_pct: ex.change_pct,
        volume: ex.volume,
        fetched_at: new Date(),
      },
    })
  }

  for (const fx of fxRates) {
    await prisma.fXRate.create({
      data: {
        pair: fx.pair,
        rate: fx.rate,
        change_pct: fx.change_pct,
        fetched_at: new Date(),
      },
    })
  }

  // Commodity prices (sourced from mock until a commodities API key is configured)
  const commodities = [
    { commodity: 'Crude Oil (Brent)', price: 74.82, unit: 'USD/bbl', change_pct: -0.45 },
    { commodity: 'Gold', price: 2312, unit: 'USD/oz', change_pct: 0.78 },
    { commodity: 'Copper', price: 9840, unit: 'USD/t', change_pct: 1.23 },
    { commodity: 'Cocoa', price: 8450, unit: 'USD/t', change_pct: -2.1 },
    { commodity: 'Coffee', price: 312, unit: 'USD/cwt', change_pct: 0.55 },
    { commodity: 'Platinum', price: 1020, unit: 'USD/oz', change_pct: -0.32 },
  ]

  for (const c of commodities) {
    await prisma.commodityPrice.create({
      data: {
        commodity: c.commodity,
        price: c.price,
        unit: c.unit,
        change_pct: c.change_pct,
        fetched_at: new Date(),
      },
    })
  }
}
