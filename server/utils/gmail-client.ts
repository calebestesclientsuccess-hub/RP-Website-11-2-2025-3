import { google } from 'googleapis';

let connectionSettings: any;

async function getCredentials() {
  if (connectionSettings && connectionSettings?.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return {
      accessToken: connectionSettings.settings.access_token || connectionSettings.settings?.oauth?.credentials?.access_token,
      email: connectionSettings.settings?.email || connectionSettings.settings?.oauth?.email
    };
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;
  const email = connectionSettings?.settings?.email || connectionSettings?.settings?.oauth?.email;

  if (!connectionSettings) {
    throw new Error('Gmail connector not found - please ensure Gmail integration is set up');
  }
  
  if (!accessToken) {
    throw new Error('Gmail access token not found - please reconnect Gmail integration');
  }
  
  if (!email) {
    throw new Error('Gmail sender email not found in connector settings - please reconnect Gmail integration');
  }
  
  return { accessToken, email };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGmailClient() {
  const { accessToken } = await getCredentials();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Helper function to send email via Gmail API
export async function sendGmailEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const { accessToken, email: fromEmail } = await getCredentials();
  
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  // Create email message in RFC 2822 format with required From header
  const emailLines = [
    `From: ${fromEmail}`,
    `To: ${options.to}`,
    `Subject: ${options.subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    options.html
  ];
  
  const email = emailLines.join('\r\n');
  
  // Encode the email in base64url format
  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Send the email
  try {
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });
    
    console.log('Gmail API send successful:', {
      status: result.status,
      statusText: result.statusText,
      messageId: result.data.id,
      to: options.to
    });
    
    return result;
  } catch (error: any) {
    console.error('Gmail API send failed:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      to: options.to
    });
    throw error;
  }
}
