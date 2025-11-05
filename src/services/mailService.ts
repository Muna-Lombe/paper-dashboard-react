import { Env } from '../index';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Mail service for sending emails via Cloudflare Workers
 * Supports SendGrid and local/mock sending for development
 */
export class MailService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Send email using SendGrid API
   */
  async sendEmail(options: MailOptions): Promise<boolean> {
    try {
      // Check if SendGrid is configured
      const sendgridApiKey = this.env.SENDGRID_API_KEY;
      
      if (!sendgridApiKey) {
        console.warn('SendGrid API key not configured. Email will not be sent.');
        console.log(`[MOCK EMAIL] To: ${options.to}`);
        console.log(`[MOCK EMAIL] Subject: ${options.subject}`);
        return true; // Allow app to continue without emails in dev
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to }],
              subject: options.subject,
            },
          ],
          from: {
            email: this.env.SENDGRID_FROM_EMAIL || 'noreply@paperdash.com',
            name: 'Paper Dash',
          },
          content: [
            {
              type: 'text/html',
              value: options.html,
            },
            ...(options.text
              ? [
                  {
                    type: 'text/plain',
                    value: options.text,
                  },
                ]
              : []),
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('SendGrid API error:', error);
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Mail service error:', error.message);
      return false;
    }
  }

  /**
   * Generate email verification template
   */
  generateVerificationEmail(email: string, verificationLink: string): MailOptions {
    return {
      to: email,
      subject: 'Verify your Paper Dash account',
      html: `
        <h2>Welcome to Paper Dash!</h2>
        <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
        <p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email Address
          </a>
        </p>
        <p>Or copy and paste this link:</p>
        <p><code>${verificationLink}</code></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
      text: `
Welcome to Paper Dash!

Thank you for signing up. Please verify your email address to complete your registration.

Verification link: ${verificationLink}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.
      `,
    };
  }

  /**
   * Generate password reset template
   */
  generatePasswordResetEmail(email: string, resetLink: string): MailOptions {
    return {
      to: email,
      subject: 'Reset your Paper Dash password',
      html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to create a new password:</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link:</p>
        <p><code>${resetLink}</code></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email and your password will not be changed.</p>
      `,
      text: `
Password Reset Request

We received a request to reset your password. Visit the link below to create a new password:

Reset link: ${resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email and your password will not be changed.
      `,
    };
  }
}

export default MailService;
