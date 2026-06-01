import Anthropic from '@anthropic-ai/sdk'
import { ArticleResponseSchema, SignalScanSchema, CountryBriefSchema } from './schemas'
import { buildArticlePrompt, buildSignalScanPrompt, buildCountryBriefPrompt } from './prompts'
import type { ArticleResponse } from './schemas'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function extractJSON(text: string): unknown {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (match) return JSON.parse(match[1])
  // fallback: try parsing the whole thing
  return JSON.parse(text)
}

export async function generateArticle(
  sources: { title: string; content: string; url: string; publishedAt: string }[],
): Promise<ArticleResponse> {
  const prompt = buildArticlePrompt(sources)
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const raw = extractJSON(text)
  return ArticleResponseSchema.parse(raw)
}

export async function generateSignalScan(region: string, sector: string, context: string) {
  const prompt = buildSignalScanPrompt(region, sector, context)
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const raw = extractJSON(text)
  return SignalScanSchema.parse(raw)
}

export async function generateCountryBrief(
  country: string,
  recentArticles: string[],
  marketData: string,
) {
  const prompt = buildCountryBriefPrompt(country, recentArticles, marketData)
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3072,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const raw = extractJSON(text)
  return CountryBriefSchema.parse(raw)
}
