import { z } from 'zod'

export const ArticleResponseSchema = z.object({
  kicker: z.string().max(60),
  headline: z.string().max(120),
  dek: z.string().max(300),
  byline: z.string(),
  dateline: z.string(),
  body: z.string(), // HTML formatted article, ~600-900 words
  country: z.string(),
  region: z.enum(['West Africa', 'East Africa', 'Southern Africa', 'North Africa', 'Central Africa', 'Pan-Africa']),
  sector: z.string(),
  move: z.enum(['GAINER', 'LOSER', 'NEUTRAL']),
  signal: z.enum(['BUY', 'WATCH', 'SELL', 'HOLD']),
  magnitude: z.string(), // e.g. "+3.2%" or "-1.8%"
  verdict: z.string().max(200), // one-sentence investment verdict
  gainers: z.array(z.object({ name: z.string(), change: z.string() })),
  losers: z.array(z.object({ name: z.string(), change: z.string() })),
  watchlist: z.array(z.object({ name: z.string(), reason: z.string() })),
  diasp_opp: z.string().max(300), // diaspora opportunity paragraph
  pull_quote: z.string().max(180),
  read_time: z.string(), // e.g. "4 min read"
  is_premium: z.boolean(),
})

export type ArticleResponse = z.infer<typeof ArticleResponseSchema>

export const SignalScanSchema = z.object({
  signals: z.array(z.object({
    country: z.string(),
    sector: z.string(),
    signal: z.enum(['BUY', 'WATCH', 'SELL', 'HOLD']),
    rationale: z.string().max(200),
    magnitude: z.string(),
  }))
})

export const CountryBriefSchema = z.object({
  country: z.string(),
  investment_rating: z.enum(['OVERWEIGHT', 'NEUTRAL', 'UNDERWEIGHT']),
  brief: z.string(), // HTML, ~400 words
  key_themes: z.array(z.string()),
  risks: z.array(z.string()),
  opportunities: z.array(z.string()),
  macro_outlook: z.string().max(300),
})
