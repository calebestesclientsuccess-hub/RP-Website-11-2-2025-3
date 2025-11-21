import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  // 1. Check for direct API Key (Vercel/Local)
  if (process.env.RESEND_API_KEY) {
    return { 
      apiKey: process.env.RESEND_API_KEY, 
      fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev' 
    };
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    // Return null or throw if neither env var nor Replit token exists
    // But original code threw error.
    // Let's keep throwing if we can't find credentials.
    if (!process.env.RESEND_API_KEY) {
       // If we are here, RESEND_API_KEY is missing AND we might be on Replit.
       // If hostname is missing, we definitely can't use Replit.
       if (!hostname) throw new Error('Resend API Key not configured (RESEND_API_KEY)');
    }
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail
  };
}
