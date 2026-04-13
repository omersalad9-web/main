// Vault — Root navigator
// Handles auth flow: Lock → Onboarding → Main tabs

import React, { useState, useEffect, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getPreference } from '../database/database';
import { useAuthContext } from '../hooks/AuthContext';
import type { RootStackParamList } from '../types';

import LockScreen from '../screens/LockScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated } = useAuthContext();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  async function checkOnboarding() {
    try {
      const value = await getPreference('has_completed_onboarding');
      setHasCompletedOnboarding(value === 'true');
    } catch {
      setHasCompletedOnboarding(false);
    }
  }

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
  }, []);

  // Still loading
  if (hasCompletedOnboarding === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Lock" component={LockScreen} />
      ) : !hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding">
          {() => <OnboardingScreen onComplete={completeOnboarding} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}
