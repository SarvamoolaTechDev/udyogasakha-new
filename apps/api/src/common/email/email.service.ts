import { Injectable, Logger } from '@nestjs/common';
import { EmailClient } from '@azure/communication-email';
import { AppConfigService } from '../../config/app-config.service';

export interface SendEmailParams {
  to:       string;
  subject:  string;
  body:     string;
  /** Optional CTA link — rendered as a button in HTML and a plain URL in text. */
  link?:    string;
  /** Human-readable label for the link button. Defaults to 'Open →' */
  linkLabel?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: EmailClient | null;
  private readonly senderAddress: string;
  private readonly webUrl: string;

  constructor(private readonly config: AppConfigService) {
    const connectionString = config.azureCommunicationConnectionString;
    this.senderAddress = config.azureEmailSenderAddress;
    this.webUrl        = config.webUrl;

    if (connectionString) {
      this.client = new EmailClient(connectionString);
    } else {
      this.client = null;
      this.logger.warn(
        'AZURE_COMMUNICATION_CONNECTION_STRING is not set — emails will be logged to console. ' +
        'Set this env var to enable real email delivery via Azure Communication Service.',
      );
    }
  }

  async send({ to, subject, body, link, linkLabel = 'Open →' }: SendEmailParams): Promise<void> {
    // Resolve relative links to absolute URLs
    const absoluteLink = link
      ? (link.startsWith('http') ? link : `${this.webUrl}${link}`)
      : null;

    const plainText = absoluteLink
      ? `${body}\n\n${linkLabel}: ${absoluteLink}`
      : body;

    if (!this.client) {
      this.logger.log(`[EMAIL — NOT CONFIGURED] To: ${to} | Subject: ${subject}\n${plainText}`);
      return;
    }

    const html = this.buildHtml({ subject, body, link: absoluteLink, linkLabel });

    const poller = await this.client.beginSend({
      senderAddress: this.senderAddress,
      content: { subject, plainText, html },
      recipients: { to: [{ address: to }] },
    });

    const result = await poller.pollUntilDone();

    if (result.status !== 'Succeeded') {
      this.logger.error(`Email to ${to} did not succeed — ACS status: ${result.status}`);
      throw new Error(`Azure Communication Service email send failed with status: ${result.status}`);
    }

    this.logger.debug(`Email sent to ${to} — ACS messageId: ${result.id}`);
  }

  /**
   * Branded HTML email template — Sarvamoola Udyoga Sakha
   * Works in Gmail, Outlook, Apple Mail, and mobile email clients.
   * Inline styles only — no external CSS (required for email client compatibility).
   */
  private buildHtml({ subject, body, link, linkLabel }: {
    subject: string; body: string; link: string | null; linkLabel: string;
  }): string {
    const ctaButton = link ? `
      <table cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;">
        <tr>
          <td align="center" bgcolor="#D4A017" style="border-radius: 50px;">
            <a href="${this.escapeHtml(link)}"
               target="_blank"
               style="display: inline-block; padding: 13px 28px; font-family: Arial, sans-serif;
                      font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none;
                      border-radius: 50px; letter-spacing: 0.5px;">
              ${this.escapeHtml(linkLabel)}
            </a>
          </td>
        </tr>
      </table>
      <p style="font-size: 11px; color: #888888; text-align: center; margin: 0 0 8px;">
        Or copy this link into your browser:
      </p>
      <p style="font-size: 11px; color: #D4A017; text-align: center; word-break: break-all; margin: 0 0 24px;">
        ${this.escapeHtml(link)}
      </p>
    ` : '';

    const bodyParagraphs = body
      .split('\n')
      .filter(line => line.trim())
      .map(line => `<p style="font-size: 14px; color: #374151; line-height: 1.75; margin: 0 0 12px;">${this.escapeHtml(line)}</p>`)
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${this.escapeHtml(subject)}</title></head>
<body style="margin: 0; padding: 0; background-color: #F5F7FF; font-family: Arial, Helvetica, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F5F7FF; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="520"
               style="background-color: #ffffff; border-radius: 16px;
                      border: 1px solid rgba(212,160,23,0.2);
                      box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding: 28px 32px 20px;
                border-bottom: 2px solid rgba(212,160,23,0.15);">
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 2px;
                         text-transform: uppercase; color: #D4A017;">
                SARVAMOOLA
              </p>
              <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1E2A4A;">
                Udyoga Sakha
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px 8px;">
              <h2 style="margin: 0 0 18px; font-size: 18px; font-weight: 700; color: #1E2A4A; line-height: 1.3;">
                ${this.escapeHtml(subject)}
              </h2>
              ${bodyParagraphs}
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding: 8px 32px 0;">
              ${ctaButton}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px 28px; border-top: 1px solid #F0F2FA;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #9CA3AF; text-align: center;">
                This is an automated message from Sarvamoola Udyoga Sakha.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}