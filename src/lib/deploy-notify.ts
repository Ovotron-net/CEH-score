/**
 * Sends deployment status notifications to Discord
 */

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: Array<{
    name: string;
    value: string;
    inline: boolean;
  }>;
  timestamp: string;
}

interface DiscordPayload {
  embeds: DiscordEmbed[];
}

export async function notifyDiscordDeployment(status: 'success' | 'failure' | 'error'): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL not set, skipping Discord notification');
    return;
  }

  const colorMap: Record<string, number> = {
    success: 3066993,  // green
    failure: 15158332, // red
    error: 15158332,   // red
  };

  const statusEmoji: Record<string, string> = {
    success: '✅',
    failure: '❌',
    error: '⚠️',
  };

  const commit = process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown';
  const branch = process.env.RAILWAY_GIT_BRANCH || 'unknown';
  const environment = process.env.RAILWAY_ENVIRONMENT_NAME || 'production';
  const deploymentUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : 'https://ceh-score-production-4dc6.up.railway.app';

  const payload: DiscordPayload = {
    embeds: [
      {
        title: `${statusEmoji[status]} Deployment ${status.toUpperCase()} — CEH-score`,
        description: `[View deployment](${deploymentUrl})`,
        color: colorMap[status],
        fields: [
          {
            name: 'Environment',
            value: environment,
            inline: true,
          },
          {
            name: 'Branch',
            value: branch,
            inline: true,
          },
          {
            name: 'Commit',
            value: commit,
            inline: true,
          },
          {
            name: 'Status',
            value: status.charAt(0).toUpperCase() + status.slice(1),
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Discord notification failed: ${response.status} ${response.statusText}`);
    } else {
      console.log(`Discord notification sent: deployment ${status}`);
    }
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}

