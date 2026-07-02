/**
 * Notifies Discord when the application successfully starts
 * This runs once when the Next.js server is ready
 */

import { notifyDiscordDeployment } from './deploy-notify';

let notificationSent = false;

export async function notifyOnStartup(): Promise<void> {
  if (notificationSent) {
    return;
  }

  notificationSent = true;

  // Small delay to ensure server is fully ready
  setTimeout(async () => {
    try {
      await notifyDiscordDeployment('success');
    } catch (error) {
      console.error('Failed to notify Discord on startup:', error);
    }
  }, 1000);
}

