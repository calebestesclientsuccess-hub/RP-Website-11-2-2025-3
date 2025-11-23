import { getUncachableResendClient } from "./resend-client";
import { storage } from "../storage";
import type { Lead } from "@shared/schema";

export async function sendLeadNotificationEmail(lead: Lead): Promise<void> {
  try {
    // Get all users to notify
    const users = await storage.getAllUsers();
    
    // Filter users with emails
    const usersWithEmails = users.filter(user => user.email);
    
    if (usersWithEmails.length === 0) {
      console.log("No users with emails to notify about lead");
      return;
    }

    // Parse form data if it exists
    let formData = null;
    try {
      formData = lead.formData ? JSON.parse(lead.formData) : null;
    } catch (error) {
      console.error("Error parsing lead form data:", error);
    }

    // Build email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 20px;
            border-radius: 0 0 8px 8px;
          }
          .field {
            margin-bottom: 15px;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #667eea;
          }
          .label {
            font-weight: 600;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .value {
            font-size: 16px;
            color: #333;
          }
          .source {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .timestamp {
            color: #999;
            font-size: 14px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">New Lead Captured!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You have a new prospect to follow up with</p>
        </div>
        <div class="content">
          ${lead.email ? `
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${lead.email}">${lead.email}</a></div>
            </div>
          ` : ''}
          
          ${lead.name ? `
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${lead.name}</div>
            </div>
          ` : ''}
          
          ${lead.company ? `
            <div class="field">
              <div class="label">Company</div>
              <div class="value">${lead.company}</div>
            </div>
          ` : ''}
          
          ${lead.phone ? `
            <div class="field">
              <div class="label">Phone</div>
              <div class="value"><a href="tel:${lead.phone}">${lead.phone}</a></div>
            </div>
          ` : ''}
          
          <div class="field">
            <div class="label">Source</div>
            <div class="value"><span class="source">${lead.source}</span></div>
          </div>
          
          ${lead.pageUrl ? `
            <div class="field">
              <div class="label">Page</div>
              <div class="value">${lead.pageUrl}</div>
            </div>
          ` : ''}
          
          ${formData ? `
            <div class="field">
              <div class="label">Additional Information</div>
              <div class="value">
                ${Object.entries(formData)
                  .filter(([key]) => !['email', 'name', 'company', 'phone'].includes(key))
                  .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
                  .join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="timestamp">
            Captured on ${new Date(lead.createdAt).toLocaleString()}
          </div>
        </div>
      </body>
      </html>
    `;

    const { client, fromEmail } = await getUncachableResendClient();

    // Send email to all users via Resend
    const emailPromises = usersWithEmails.map(user =>
      client.emails
        .send({
          from: fromEmail,
          to: user.email!,
          subject: `New Lead: ${lead.name || lead.email} from ${lead.source}`,
          html: emailHtml,
        })
        .catch((error) => {
          console.error(`Failed to send lead notification to ${user.email}:`, error);
        }),
    );

    await Promise.all(emailPromises);
    console.log(`Lead notification sent to ${usersWithEmails.length} user(s) via Resend`);
  } catch (error) {
    console.error("Error sending lead notification email:", error);
    // Don't throw - we don't want email failures to block lead capture
  }
}
