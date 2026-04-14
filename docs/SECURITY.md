# Vault — Security Checklist

This document confirms that Vault meets its core privacy and security commitments. Every item must be verified before any App Store submission.

## Data Storage

- [x] All financial data stored in local SQLite database only
- [x] Database uses WAL mode with foreign key enforcement
- [x] OAuth tokens stored in Expo Secure Store (AES-256)
  - iOS: Keychain Services with `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`
  - Android: Android Keystore system
- [x] No cloud sync, no remote database connections
- [x] No user accounts — the device is the account

## Network Communication

- [x] Only outbound connections: TrueLayer API (read-only bank data)
- [x] No data sent to any Vault-owned servers (none exist)
- [x] No analytics SDKs: no Firebase, no Mixpanel, no Amplitude, no Segment
- [x] No external crash reporting: no Sentry, no Crashlytics, no Bugsnag
- [x] No advertising SDKs or tracking pixels
- [x] No telemetry of any kind

## Authentication

- [x] Biometric authentication required (Face ID / Fingerprint)
- [x] Uses expo-local-authentication with system-level biometrics
- [x] No server-side password recovery — by design
- [x] App locks when backgrounded
- [x] No session tokens sent over network

## Open Banking (TrueLayer)

- [x] Read-only permissions only — no payment initiation
- [x] Scopes limited to: `accounts`, `balance`, `transactions`, `cards`
- [x] Access tokens stored encrypted on device, never transmitted to our servers
- [x] Token revocation available per-account in Settings
- [x] TrueLayer is FCA regulated (reference number: 901096)

## On-Device Processing

- [x] Subscription detection runs locally
- [x] Anomaly detection runs locally
- [x] Health score calculation runs locally
- [x] Push notifications scheduled locally (no remote push server)
- [x] No data sent to any AI/ML cloud service

## App Store Compliance

- [x] Privacy label: "Data Not Collected"
- [x] GDPR compliant by design (no personal data collection)
- [x] No third-party SDKs that collect user data
- [x] Privacy policy accurately reflects zero-collection architecture
- [x] NSFaceIDUsageDescription provided in Info.plist

## Code-Level Checks

- [x] No hardcoded API keys in source code
- [x] Environment variables used for TrueLayer credentials
- [x] `.gitignore` excludes `.env`, credentials, and token files
- [x] No `console.log` of sensitive data in production builds
- [x] No screenshots or screen recording of financial data
