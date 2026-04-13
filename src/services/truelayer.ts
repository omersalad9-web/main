// Vault — TrueLayer Open Banking integration (web version)
// Read-only bank access. No payment initiation permissions.

import { APP_CONFIG } from '../constants/config';
import { storeEncryptedToken, getEncryptedToken, deleteEncryptedToken } from '../database/database';
import type { Account, Transaction } from '../types';

const { trueLayer } = APP_CONFIG;

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

// Map to Vault account model
export function mapToVaultAccount(name: string, provider: string, balance: number): Omit<Account, 'id'> {
  return {
    name,
    type: 'bank',
    provider,
    balance,
    currency: 'GBP',
    lastSynced: new Date().toISOString(),
  };
}
