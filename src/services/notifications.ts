// Vault — Web notifications (browser Notification API)
// No external push services. All local.

import type { AnomalyAlert } from '../types';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function sendAnomalyNotification(alert: AnomalyAlert): Promise<void> {
  if (Notification.permission !== 'granted') return;
  new Notification('Vault Alert', {
    body: alert.message,
    icon: '/vault-icon.png',
    tag: alert.id,
  });
}
