import { z } from "zod";

// ============================================================
// ENUMS
// ============================================================

export type ArticleMove = "GAINER" | "LOSER" | "NEUTRAL";
export type ArticleSignal = "BUY" | "WATCH" | "SELL" | "HOLD";
export type UserPlan = "free" | "analyst" | "diaspora_pro";
export type AlertType = "PRICE" | "FX_RATE" | "SIGNAL" | "KEYWORD";
export type AlertChannel = "EMAIL" | "IN_APP";

// ============================================================
// ARTICLE
// ============================================================

export interface Article {
  id: string;
  slug: string;
  kicker: string;
  headline: string;
  dek: string;
  byline: string;
  dateline: string;
  body: string;
  country: string;
  region: string;
  sector: string;
  move: ArticleMove;
  signal: ArticleSignal;
  magnitude: number;
  verdict: string;
  gainers: string[];
  losers: string[];
  watchlist: string[];
  diasp_opp: string | null;
  pull_quote: string | null;
  read_time: number;
  source_urls: string[];
  published_at: Date;
  created_at: Date;
  is_premium: boolean;
}

// Lightweight card representation used in listings
export type ArticleCard = Pick<
  Article,
  | "id"
  | "slug"
  | "kicker"
  | "headline"
  | "dek"
  | "byline"
  | "dateline"
  | "country"
  | "region"
  | "sector"
  | "move"
  | "signal"
  | "magnitude"
  | "read_time"
  | "published_at"
  | "is_premium"
>;

// ============================================================
// MARKET SNAPSHOT
// ============================================================

export interface MarketSnapshot {
  id: string;
  exchange: string;
  country: string;
  price: number;
  change_pct: number;
  volume: bigint | null;
  fetched_at: Date;
}

// ============================================================
// FX RATE
// ============================================================

export interface FXRate {
  id: string;
  pair: string;
  rate: number;
  change_pct: number;
  fetched_at: Date;
}

// ============================================================
// COMMODITY PRICE
// ============================================================

export interface CommodityPrice {
  id: string;
  commodity: string;
  price: number;
  unit: string;
  change_pct: number;
  fetched_at: Date;
}

// ============================================================
// USER
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: Date | null;
  image: string | null;
  plan: UserPlan;
  stripe_customer_id: string | null;
  articles_read_today: number;
  regions: string[];
  sectors: string[];
  created_at: Date;
  updated_at: Date;
}

// Public-safe user profile (no sensitive fields)
export type UserProfile = Pick<
  User,
  "id" | "email" | "name" | "image" | "plan" | "regions" | "sectors" | "created_at"
>;

// ============================================================
// BOOKMARK
// ============================================================

export interface Bookmark {
  user_id: string;
  article_id: string;
  created_at: Date;
  article?: Article;
}

// ============================================================
// ALERT
// ============================================================

export interface Alert {
  id: string;
  user_id: string;
  type: AlertType;
  value: string;
  channel: AlertChannel;
  active: boolean;
}

// ============================================================
// NEWS SOURCE
// ============================================================

export interface NewsSource {
  id: string;
  name: string;
  country: string;
  region: string;
  rssUrl?: string;
  apiEndpoint?: string;
  language: string;
  isActive: boolean;
  priority: number; // 1 = highest
}

// ============================================================
// CLAUDE ARTICLE RESPONSE — Zod schema + TypeScript type
// ============================================================

export const ClaudeArticleResponseSchema = z.object({
  kicker: z
    .string()
    .max(60)
    .describe("Short section label, e.g. 'NIGERIAN EQUITIES'"),
  headline: z
    .string()
    .max(120)
    .describe("Punchy, declarative main headline"),
  dek: z
    .string()
    .max(250)
    .describe("Supporting subtitle that expands on the headline"),
  byline: z
    .string()
    .max(80)
    .describe("Author attribution, e.g. 'By AFR Staff'"),
  dateline: z
    .string()
    .max(60)
    .describe("City and date, e.g. 'LAGOS, 1 June 2026'"),
  body: z
    .string()
    .min(400)
    .describe("Full article body in newspaper prose, 400–900 words"),
  country: z.string().describe("ISO 3166-1 alpha-2 country code, e.g. 'NG'"),
  region: z
    .enum([
      "West Africa",
      "East Africa",
      "Southern Africa",
      "North Africa",
      "Central Africa",
      "Pan-Africa",
    ])
    .describe("African region"),
  sector: z
    .string()
    .max(60)
    .describe("Industry sector, e.g. 'Banking', 'Telecoms', 'Agriculture'"),
  move: z
    .enum(["GAINER", "LOSER", "NEUTRAL"])
    .describe("Overall market direction of the subject"),
  signal: z
    .enum(["BUY", "WATCH", "SELL", "HOLD"])
    .describe("Investment signal for the subject"),
  magnitude: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence / magnitude of the signal, 0–100"),
  verdict: z
    .string()
    .max(300)
    .describe("One-paragraph editorial verdict on the investment case"),
  gainers: z
    .array(z.string())
    .max(5)
    .describe("Tickers or company names that stand to gain"),
  losers: z
    .array(z.string())
    .max(5)
    .describe("Tickers or company names that stand to lose"),
  watchlist: z
    .array(z.string())
    .max(5)
    .describe("Tickers or company names to monitor"),
  diasp_opp: z
    .string()
    .max(400)
    .nullable()
    .describe("Diaspora remittance or investment opportunity angle, if any"),
  pull_quote: z
    .string()
    .max(200)
    .nullable()
    .describe("A compelling pull quote for the article layout"),
  read_time: z
    .number()
    .int()
    .min(1)
    .max(30)
    .describe("Estimated reading time in minutes"),
  is_premium: z
    .boolean()
    .describe("Whether this article should be gated for paid subscribers"),
});

export type ClaudeArticleResponse = z.infer<typeof ClaudeArticleResponseSchema>;

// ============================================================
// MARKET DATA — aggregated snapshot for the dashboard
// ============================================================

export interface MarketData {
  exchanges: MarketSnapshot[];
  fxRates: FXRate[];
  commodities: CommodityPrice[];
  lastUpdated: Date;
}

// ============================================================
// API RESPONSE WRAPPERS
// ============================================================

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ============================================================
// PAGINATION
// ============================================================

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ============================================================
// FILTERS
// ============================================================

export interface ArticleFilters {
  region?: string;
  country?: string;
  sector?: string;
  signal?: ArticleSignal;
  move?: ArticleMove;
  isPremium?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================
// SUBSCRIPTION / PLAN DETAILS
// ============================================================

export interface PlanFeatures {
  name: string;
  plan: UserPlan;
  priceMonthly: number;
  priceAnnual: number;
  articlesPerDay: number | "unlimited";
  premiumAccess: boolean;
  emailAlerts: boolean;
  marketData: boolean;
  apiAccess: boolean;
  diasporaInsights: boolean;
}

export const PLAN_FEATURES: Record<UserPlan, PlanFeatures> = {
  free: {
    name: "Free",
    plan: "free",
    priceMonthly: 0,
    priceAnnual: 0,
    articlesPerDay: 5,
    premiumAccess: false,
    emailAlerts: false,
    marketData: true,
    apiAccess: false,
    diasporaInsights: false,
  },
  analyst: {
    name: "Analyst",
    plan: "analyst",
    priceMonthly: 29,
    priceAnnual: 290,
    articlesPerDay: "unlimited",
    premiumAccess: true,
    emailAlerts: true,
    marketData: true,
    apiAccess: false,
    diasporaInsights: false,
  },
  diaspora_pro: {
    name: "Diaspora Pro",
    plan: "diaspora_pro",
    priceMonthly: 49,
    priceAnnual: 490,
    articlesPerDay: "unlimited",
    premiumAccess: true,
    emailAlerts: true,
    marketData: true,
    apiAccess: true,
    diasporaInsights: true,
  },
};
