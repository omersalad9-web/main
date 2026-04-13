// Vault — TrueLayer Open Banking integration
// Read-only bank access. No payment initiation permissions.
// Tokens stored encrypted on device via expo-secure-store.

import { APP_CONFIG } from '../constants/config';
import { storeEncryptedToken, getEncryptedToken, deleteEncryptedToken } from '../database/database';
import type { Account, Transaction } from '../types';

const { trueLayer } = APP_CONFIG;

interface TrueLayerAccount {
  account_id: string;
  display_name: string;
  provider: { display_name: string; provider_id: string };
  currency: string;
  account_type: string;
}

interface TrueLayerBalance {
  current: number;
  currency: string;
}

interface TrueLayerTransaction {
  transaction_id: string;
  amount: number;
  currency: string;
  description: string;
  merchant_name: string | null;
  transaction_category: string;
  timestamp: string;
}

// Build the TrueLayer auth URL for OAuth redirect
export function getTrueLayerAuthUrl(): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: trueLayer.clientId,
    redirect_uri: trueLayer.redirectUri,
    scope: trueLayer.scopes.join(' '),
    providers: 'uk-ob-all',
  });
  return `${trueLayer.authUrl}/?${params.toString()}`;
}

// Exchange authorization code for access token (stored encrypted on device)
export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch(`${trueLayer.authUrl}/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: trueLayer.clientId,
      redirect_uri: trueLayer.redirectUri,
      code,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`TrueLayer token exchange failed: ${response.status}`);
  }

  const data = await response.json();
  const tokenKey = `truelayer_token_${Date.now()}`;
  await storeEncryptedToken(tokenKey, data.access_token);
  return data.access_token;
}

// Fetch all accounts from TrueLayer
export async function fetchAccounts(accessToken: string): Promise<TrueLayerAccount[]> {
  const response = await fetch(`${trueLayer.apiUrl}/data/v1/accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`TrueLayer accounts fetch failed: ${response.status}`);
  }

  const data = await response.json();
  return data.results ?? [];
}

// Fetch balance for a specific account
export async function fetchAccountBalance(accessToken: string, accountId: string): Promise<TrueLayerBalance> {
  const response = await fetch(`${trueLayer.apiUrl}/data/v1/accounts/${accountId}/balance`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`TrueLayer balance fetch failed: ${response.status}`);
  }

  const data = await response.json();
  return data.results?.[0] ?? { current: 0, currency: 'GBP' };
}

// Fetch transactions for a specific account
export async function fetchTransactions(
  accessToken: string,
  accountId: string,
  from: string,
  to: string,
): Promise<TrueLayerTransaction[]> {
  const params = new URLSearchParams({ from, to });
  const response = await fetch(
    `${trueLayer.apiUrl}/data/v1/accounts/${accountId}/transactions?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new Error(`TrueLayer transactions fetch failed: ${response.status}`);
  }

  const data = await response.json();
  return data.results ?? [];
}

// Map TrueLayer account to Vault account model
export function mapToVaultAccount(tlAccount: TrueLayerAccount, balance: TrueLayerBalance): Omit<Account, 'id'> {
  return {
    name: tlAccount.display_name,
    type: 'bank',
    provider: tlAccount.provider.display_name,
    balance: balance.current,
    currency: balance.currency,
    lastSynced: new Date().toISOString(),
  };
}

// Map TrueLayer transactions to Vault transaction model
export function mapToVaultTransactions(
  tlTransactions: TrueLayerTransaction[],
  vaultAccountId: string,
): Omit<Transaction, 'id'>[] {
  return tlTransactions.map((t) => ({
    accountId: vaultAccountId,
    amount: t.amount,
    currency: t.currency,
    description: t.description,
    merchant: t.merchant_name ?? 'Unknown',
    category: t.transaction_category ?? 'other',
    date: t.timestamp,
    isRecurring: false,
    isAnomaly: false,
  }));
}

// Store token securely for an account
export async function storeAccountToken(accountId: string, token: string): Promise<void> {
  await storeEncryptedToken(`truelayer_token_${accountId}`, token);
}

// Retrieve stored token for an account
export async function getAccountToken(accountId: string): Promise<string | null> {
  return getEncryptedToken(`truelayer_token_${accountId}`);
}

// Revoke and delete stored token
export async function revokeAccountAccess(accountId: string): Promise<void> {
  await deleteEncryptedToken(`truelayer_token_${accountId}`);
}
