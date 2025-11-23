/**
 * Resend email service mock for testing
 * Captures email payloads without sending real emails
 */

export interface MockEmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  reply_to?: string | string[];
  headers?: Record<string, string>;
}

export interface MockEmailResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
}

class MockResendEmails {
  private sentEmails: MockEmailPayload[] = [];
  private shouldFail = false;
  private failureError: Error | null = null;

  async send(payload: MockEmailPayload): Promise<{ data: MockEmailResponse; error: null }> {
    if (this.shouldFail) {
      throw this.failureError || new Error('Mock email send failure');
    }

    this.sentEmails.push(payload);

    return {
      data: {
        id: `mock-email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        from: payload.from,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        created_at: new Date().toISOString(),
      },
      error: null,
    };
  }

  // Test helpers
  getSentEmails(): MockEmailPayload[] {
    return [...this.sentEmails];
  }

  getLastSentEmail(): MockEmailPayload | undefined {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  clear(): void {
    this.sentEmails = [];
    this.shouldFail = false;
    this.failureError = null;
  }

  simulateFailure(error?: Error): void {
    this.shouldFail = true;
    this.failureError = error || new Error('Simulated email failure');
  }

  restoreSuccess(): void {
    this.shouldFail = false;
    this.failureError = null;
  }

  getEmailCount(): number {
    return this.sentEmails.length;
  }

  getEmailsTo(recipient: string): MockEmailPayload[] {
    return this.sentEmails.filter((email) => {
      const to = Array.isArray(email.to) ? email.to : [email.to];
      return to.includes(recipient);
    });
  }

  getEmailsBySubject(subject: string): MockEmailPayload[] {
    return this.sentEmails.filter((email) => email.subject.includes(subject));
  }
}

export class MockResend {
  public emails: MockResendEmails;

  constructor() {
    this.emails = new MockResendEmails();
  }

  // Expose test helpers at top level for convenience
  getSentEmails(): MockEmailPayload[] {
    return this.emails.getSentEmails();
  }

  clear(): void {
    this.emails.clear();
  }
}

export const mockResend = new MockResend();

