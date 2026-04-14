# Vault

**Your money. Your device. Your rules.**

A privacy-first financial dashboard that aggregates bank accounts, crypto wallets, and investments into one clean interface. All data is processed and stored on-device only — nothing is sent to any server.

## Features (Phase 1 — MVP)

- **Universal Account Aggregation** — Connect UK banks via TrueLayer Open Banking API
- **Net Worth Dashboard** — Real-time net worth across all accounts with visual graph
- **Subscription Killer** — Auto-detect recurring charges, flag unused subscriptions
- **Financial Health Score** — Daily 0-100 score based on savings, debt, spending, and net worth
- **Vault Lock** — Biometric-only access (Face ID / Fingerprint)
- **Anomaly Alerts** — On-device detection of duplicate charges, spending spikes, unknown merchants
- **Zero Data Collection** — No analytics, no crash reporting, no external SDKs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo (TypeScript) |
| Navigation | React Navigation (native stack + bottom tabs) |
| Local Database | SQLite via expo-sqlite (encrypted) |
| Secure Storage | expo-secure-store (AES-256 for tokens) |
| Biometrics | expo-local-authentication |
| Open Banking | TrueLayer API (read-only, FCA regulated) |
| Charts | react-native-svg (custom implementations) |
| Notifications | expo-notifications (local only) |

## Project Structure

```
vault/
├── App.tsx                    # App entry point
├── index.ts                   # Expo entry
├── app.json                   # Expo configuration
├── src/
│   ├── components/            # Shared UI components
│   │   ├── AccountTile.tsx    # Account display tile
│   │   ├── AlertBanner.tsx    # Anomaly alert banner
│   │   ├── Button.tsx         # Primary/secondary buttons
│   │   ├── Card.tsx           # Base card component
│   │   ├── EmptyState.tsx     # Empty list placeholder
│   │   ├── HealthRing.tsx     # Circular health score ring
│   │   ├── NetWorthChart.tsx  # SVG line chart
│   │   ├── SectionHeader.tsx  # Section title + see all
│   │   └── SubscriptionRow.tsx# Subscription list item
│   ├── constants/
│   │   ├── config.ts          # App configuration
│   │   └── theme.ts           # Design tokens (colors, spacing, typography)
│   ├── database/
│   │   ├── database.ts        # SQLite operations + secure storage
│   │   └── schema.ts          # Table definitions
│   ├── hooks/
│   │   ├── useAccounts.ts     # Account data management
│   │   └── useAuth.ts         # Biometric authentication
│   ├── navigation/
│   │   ├── MainTabs.tsx       # Bottom tab navigator
│   │   └── RootNavigator.tsx  # Auth flow (Lock → Onboarding → Main)
│   ├── screens/
│   │   ├── AccountsScreen.tsx     # Connected accounts
│   │   ├── HomeScreen.tsx         # Net worth dashboard
│   │   ├── InsightsScreen.tsx     # Charts + alerts
│   │   ├── LockScreen.tsx         # Biometric lock
│   │   ├── OnboardingScreen.tsx   # First-run flow
│   │   ├── SettingsScreen.tsx     # App settings
│   │   └── SubscriptionsScreen.tsx# Subscription killer
│   ├── services/
│   │   ├── anomalyDetector.ts     # On-device anomaly detection
│   │   ├── healthScore.ts         # Financial health algorithm
│   │   ├── notifications.ts       # Local push notifications
│   │   ├── subscriptionDetector.ts# Recurring charge detection
│   │   └── truelayer.ts           # Open Banking integration
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── utils/
│       └── format.ts          # Currency/date formatting
└── docs/
    ├── ARCHITECTURE.md        # Data flow and storage
    └── SECURITY.md            # Security checklist
```

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 15+ (for simulator/TestFlight)
- Android: Android Studio (for emulator)

### Installation

```bash
# Clone the repository
git clone <repo-url> vault
cd vault

# Install dependencies
npm install

# Start development server
npx expo start
```

### Environment Variables

Create a `.env` file (never committed):

```
EXPO_PUBLIC_TRUELAYER_CLIENT_ID=your_client_id_here
```

### Running on Device

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Physical device (scan QR from Expo Go)
npx expo start
```

### Building for TestFlight

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios --profile preview
```

## API Integration

### TrueLayer (Open Banking)

Vault uses TrueLayer for UK Open Banking connections. The integration is **read-only** — no payment initiation permissions are requested.

Supported banks: Barclays, HSBC, Monzo, Starling, and all UK banks available through Open Banking.

1. Register at [TrueLayer Console](https://console.truelayer.com)
2. Set redirect URI to `vault://truelayer/callback`
3. Request scopes: `accounts`, `balance`, `transactions`, `cards`
4. Add your client ID to the `.env` file

### Crypto Wallets (Phase 2)

Integration with Coinbase API and WalletConnect planned for Phase 2.

## Privacy Commitment

- No analytics SDKs (no Firebase, Mixpanel, or Amplitude)
- No external crash reporting
- Open Banking tokens stored encrypted on device only
- App Store privacy label: **Data Not Collected**
- GDPR compliant by design
- TrueLayer uses read-only bank access only

## License

Proprietary — Confidential. Not for distribution.
