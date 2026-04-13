// Vault — App configuration
// Privacy-first: no analytics, no crash reporting, no external SDKs

export const APP_CONFIG = {
  name: 'Vault',
  version: '1.0.0',
  subscriptionPrice: '£4.99/month',

  // TrueLayer Open Banking (read-only access only)
  trueLayer: {
    // These are set at build time via environment variables
    clientId: process.env.EXPO_PUBLIC_TRUELAYER_CLIENT_ID ?? '',
    authUrl: 'https://auth.truelayer.com',
    apiUrl: 'https://api.truelayer.com',
    redirectUri: 'vault://truelayer/callback',
    scopes: ['accounts', 'balance', 'transactions', 'cards'],
  },

  // Database
  database: {
    name: 'vault.db',
    version: 1,
  },

  // Health score weights
  healthScore: {
    savingsWeight: 0.30,
    debtWeight: 0.25,
    spendingWeight: 0.25,
    netWorthWeight: 0.20,
  },

  // Subscription detection
  subscriptions: {
    inactiveDaysThreshold: 30,
  },
} as const;
