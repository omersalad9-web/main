// Vault — Privacy-First Financial Dashboard
// All data processed and stored on-device only. Nothing sent to servers.

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/constants/theme';
import { AuthProvider } from './src/hooks/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

const VaultTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.accent,
  },
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer theme={VaultTheme}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
