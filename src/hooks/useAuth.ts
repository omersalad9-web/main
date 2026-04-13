// Vault — Biometric authentication hook
// The phone is the key. No server-side password recovery.

import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { getPreference, setPreference } from '../database/database';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasBiometrics: boolean;
  biometricType: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    hasBiometrics: false,
    biometricType: null,
  });

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  async function checkBiometricSupport() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: string | null = null;
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'Face ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'Fingerprint';
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        hasBiometrics: hasHardware && isEnrolled,
        biometricType,
      }));
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }

  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      const biometricEnabled = await getPreference('biometric_enabled');
      if (biometricEnabled === 'false') {
        setState((prev) => ({ ...prev, isAuthenticated: true }));
        return true;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Vault',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setState((prev) => ({ ...prev, isAuthenticated: true }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    setState((prev) => ({ ...prev, isAuthenticated: false }));
  }, []);

  const toggleBiometric = useCallback(async (enabled: boolean) => {
    await setPreference('biometric_enabled', enabled ? 'true' : 'false');
  }, []);

  return { ...state, authenticate, lock, toggleBiometric };
}
