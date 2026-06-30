import { Injectable, Logger } from '@nestjs/common';
import { EmailClient } from '@azure/communication-email';
import { AppConfigService } from '../../config/app-config.service';

export interface SendEmailParams {
  to:      string;
  subject: string;
  /** Plain-text body. Also rendered as a minimal HTML wrapper for clients that prefer HTML. */
  body:    string;
}

/**
 * Thin wrapper around Azure Communication Service's Email client.
 *
 * If AZURE_COMMUNICATION_CONNECTION_STRING is not set (e.g. local dev without
 * Azure credentials configured), this service logs the email instead of
 * sending it — so the rest of the app never has to branch on "is email
 * configured?" itself.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: EmailClient | null;
  private readonly senderAddress: string;

  constructor(private readonly config: AppConfigService) {
    const connectionString = config.azureCommunicationConnectionString;
    this.senderAddress = config.azureEmailSenderAddress;

    if (connectionString) {
      this.client = new EmailClient(connectionString);
    } else {
      this.client = null;
      this.logger.warn(
        'AZURE_COMMUNICATION_CONNECTION_STRING is not set — emails will be logged to console instead of sent. ' +
        'Set this env var to enable real email delivery via Azure Communication Service.',
      );
    }
  }

  /**
   * Sends an email and waits for ACS to confirm the send was accepted.
   * Throws on failure so BullMQ's retry logic (3 attempts, exponential
   * backoff — configured in AppModule) can recover from transient errors.
   */
  async send({ to, subject, body }: SendEmailParams): Promise<void> {
    if (!this.client) {
      this.logger.log(`[EMAIL — NOT CONFIGURED] To: ${to} | Subject: ${subject}\n${body}`);
      return;
    }

    const html = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color:#0D1E5A; margin-bottom: 16px;">Sarva Moola Udyoga Sakha</h2>
        <p style="color:#333; line-height:1.7; white-space: pre-line;">${this.escapeHtml(body)}</p>
      </div>
    `;

    const poller = await this.client.beginSend({
      senderAddress: this.senderAddress,
      content: { subject, plainText: body, html },
      recipients: { to: [{ address: to }] },
    });

    const result = await poller.pollUntilDone();

    if (result.status !== 'Succeeded') {
      this.logger.error(`Email to ${to} did not succeed — ACS status: ${result.status}`);
      throw new Error(`Azure Communication Service email send failed with status: ${result.status}`);
    }

    this.logger.debug(`Email sent to ${to} — ACS messageId: ${result.id}`);
  }

  /** Minimal HTML-escaping for the plain-text body embedded in the HTML wrapper. */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
