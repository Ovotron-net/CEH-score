/**
 * Health check endpoint that also triggers deployment success notification
 * This is called by Railway's healthcheck to verify the app is running
 */

import { notifyOnStartup } from '@/lib/startup-notify';

export async function GET() {
  // Trigger Discord notification on first successful health check
  await notifyOnStartup();

  return Response.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

