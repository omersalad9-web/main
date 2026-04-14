# Vault — Architecture Overview

## Data Flow

All data in Vault flows in one direction: from external sources (Open Banking, crypto APIs) to the local device. **No data ever flows outward** — there are no server endpoints, no analytics, no telemetry.

```
┌─────────────────────────────────────────────────┐
│                   USER DEVICE                    │
│                                                  │
│  ┌──────────┐    ┌──────────────┐               │
│  │ TrueLayer│───►│ Encrypted    │               │
│  │ API      │    │ SQLite DB    │               │
│  │ (read)   │    │              │               │
│  └──────────┘    │ - Accounts   │    ┌────────┐ │
│                  │ - Txns       │───►│ UI     │ │
│  ┌──────────┐    │ - Subs       │    │ Screens│ │
│  │ Crypto   │───►│ - Net Worth  │    └────────┘ │
│  │ APIs     │    │ - Scores     │               │
│  │ (read)   │    │ - Alerts     │               │
│  └──────────┘    └──────────────┘               │
│                         │                        │
│                  ┌──────▼───────┐               │
│                  │ Secure Store │               │
│                  │ (AES-256)    │               │
│                  │ - API tokens │               │
│                  │ - Prefs      │               │
│                  └──────────────┘               │
│                                                  │
│  ┌─────────────────────────────────┐            │
│  │ On-Device Processing            │            │
│  │ - Anomaly detection             │            │
│  │ - Subscription detection        │            │
│  │ - Health score calculation      │            │
│  │ - Local push notifications      │            │
│  └─────────────────────────────────┘            │
└─────────────────────────────────────────────────┘
```

## Storage Architecture

### SQLite Database (`vault.db`)

The local database uses WAL (Write-Ahead Logging) mode for performance and stores:

| Table | Purpose |
|-------|---------|
| `accounts` | Connected bank/crypto/investment accounts |
| `transactions` | Transaction history per account |
| `subscriptions` | Detected recurring charges |
| `net_worth_snapshots` | Daily net worth records for timeline |
| `health_scores` | Historical health score calculations |
| `anomaly_alerts` | Detected anomalies and read status |
| `user_preferences` | App settings (key-value) |

### Expo Secure Store

Used for storing sensitive data with AES-256 encryption:

- TrueLayer OAuth access tokens (per account)
- Biometric authentication preferences
- Any future API credentials

Secure Store uses:
- iOS: Keychain Services
- Android: Android Keystore + encrypted SharedPreferences

## Authentication Flow

```
App Launch
    │
    ▼
┌──────────┐     Fail     ┌──────────────┐
│ Biometric│──────────────►│ Lock Screen  │
│ Check    │               │ (retry)      │
└────┬─────┘               └──────────────┘
     │ Pass
     ▼
┌──────────────┐    No     ┌──────────────┐
│ Onboarding   │──────────►│ Onboarding   │
│ Complete?    │           │ Flow (3 pg)  │
└────┬─────────┘           └──────┬───────┘
     │ Yes                        │ Done
     ▼                            ▼
┌──────────────────────────────────┐
│         Main Dashboard           │
└──────────────────────────────────┘
```

## Open Banking Integration (TrueLayer)

1. User taps "Connect Bank" → app opens TrueLayer OAuth URL in system browser
2. User authenticates with their bank
3. TrueLayer redirects back to `vault://truelayer/callback` with auth code
4. App exchanges code for access token (stored encrypted in Secure Store)
5. App fetches accounts, balances, and transactions using access token
6. All fetched data stored in local SQLite database
7. Access token never leaves the device

**Permissions requested:** Read-only. No payment initiation.

## On-Device Intelligence

### Subscription Detection

1. Scans transaction history for recurring patterns
2. Groups by merchant name (normalized)
3. Checks for consistent amounts (within 20% variance)
4. Detects frequency from charge intervals (weekly/monthly/yearly)
5. Flags subscriptions inactive for 30+ days

### Anomaly Detection

Four detection algorithms run locally:

1. **Duplicate Charges** — Same merchant + amount within 48 hours
2. **Spending Spikes** — Daily spend > 2.5x historical average
3. **Unknown Merchants** — First-time merchant with charge > £20
4. **Unusual Amounts** — Charge > 3x merchant average (min 3 prior transactions)

### Health Score (0-100)

Weighted composite of four factors:

| Factor | Weight | Calculation |
|--------|--------|------------|
| Savings Rate | 30% | (Income - Expenses) / Income over 30 days |
| Debt Ratio | 25% | Total debt / (Total assets + Total debt) |
| Spending Trend | 25% | 2-week vs 4-week spending comparison |
| Net Worth Trend | 20% | Net worth change over available history |

## Navigation Architecture

```
RootNavigator (Native Stack)
├── LockScreen
├── OnboardingScreen
└── MainTabs (Bottom Tab Navigator)
    ├── HomeScreen (Dashboard)
    ├── AccountsScreen
    ├── SubscriptionsScreen
    ├── InsightsScreen
    └── SettingsScreen
```
