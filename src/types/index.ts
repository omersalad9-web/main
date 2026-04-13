// Vault — Core type definitions

export type AccountType = 'bank' | 'crypto' | 'investment';

export type BankProvider = 'barclays' | 'hsbc' | 'monzo' | 'starling' | 'other';
export type CryptoAsset = 'BTC' | 'ETH' | 'SOL' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  provider: string;
  balance: number;
  currency: string;
  lastSynced: string; // ISO date
  icon?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  merchant: string;
  category: string;
  date: string; // ISO date
  isRecurring: boolean;
  isAnomaly: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  lastChargeDate: string;
  nextChargeDate: string;
  isActive: boolean;
  daysSinceLastUse: number;
  cancelUrl?: string;
  accountId: string;
  merchant: string;
}

export interface NetWorthSnapshot {
  date: string;
  total: number;
  breakdown: {
    banking: number;
    crypto: number;
    investments: number;
  };
}

export interface HealthScore {
  overall: number; // 0-100
  savingsRate: number;
  debtRatio: number;
  spendingTrend: number;
  netWorthTrend: number;
  calculatedAt: string;
}

export interface AnomalyAlert {
  id: string;
  transactionId: string;
  type: 'duplicate_charge' | 'spending_spike' | 'unknown_merchant' | 'unusual_amount';
  message: string;
  severity: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}

export interface UserPreferences {
  baseCurrency: string;
  biometricEnabled: boolean;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
}

// Navigation
export type RootStackParamList = {
  Lock: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Accounts: undefined;
  Subscriptions: undefined;
  Insights: undefined;
  Settings: undefined;
};

export type AccountsStackParamList = {
  AccountsList: undefined;
  ConnectBank: undefined;
  ConnectCrypto: undefined;
  AccountDetail: { accountId: string };
};
