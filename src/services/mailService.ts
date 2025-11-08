import { Env } from '../index';
import { Fetcher } from '@cloudflare/workers-types/experimental';

export interface MailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Mail service for sending emails via Email Worker Gateway
 * Uses service binding to communicate with the email-gateway worker
 */
export class MailService {
  private emailWorker: Fetcher | undefined;
  private defaultFrom: string;
  private env: Env;

  constructor(env: Env) {
    this.emailWorker = env.EMAIL_API;
    this.defaultFrom = env.SENDGRID_FROM_EMAIL || 'noreply@paperapi.katundu.org';
    this.env = env
  }

  /**
   * Send email using Email Worker Gateway
   */
  async sendEmail(options: MailOptions): Promise<boolean> {
    try {
      // Check if email worker is configured
      if (!this.emailWorker) {
        console.warn('Email worker not configured. Email will not be sent.');
        console.log(`[MOCK EMAIL] To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
        console.log(`[MOCK EMAIL] Subject: ${options.subject}`);
        console.log(`[MOCK EMAIL] From: ${options.from || this.defaultFrom}`);
        return true; // Allow app to continue without emails in dev
      }

      // Prepare email payload
      const emailPayload = {
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        from: options.from || this.defaultFrom,
      };

      // Send request to email worker gateway
      const response = await this.emailWorker.fetch("http://email-api/gateway/send", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+ this.env.MAIL_TOKEN
        },
        body: JSON.stringify(emailPayload),
      } as any);

      // Get response body
      const responseText = await response.text();
      
      // Check if response is OK
      if (!response.ok) {
        console.error(`Email worker HTTP ${response.status}:`, responseText);
        return false;
      }

      // Parse JSON response
      let result: SendEmailResponse;
      try {
        result = JSON.parse(responseText) as SendEmailResponse;
      } catch (parseError: any) {
        console.error('Email worker returned non-JSON response:', responseText);
        return false;
      }

      if (result.success) {
        const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
        console.log(`Email sent successfully to ${recipients}. Message ID: ${result.messageId}`);
        return true;
      } else {
        console.error('Email worker error:', result.error);
        return false;
      }
    } catch (error: any) {
      console.error('Error sending email via worker:', error.message);
      return false;
    }
  }

  /**
   * Check email worker health
   */
  async checkHealth(): Promise<boolean> {
    try {
      if (!this.emailWorker) {
        return false;
      }

      const response = await this.emailWorker.fetch('https://email-api/api/health', {
        method: 'GET',
      } as any);

      const health = await response.json() as any;
      return health.status === 'healthy';
    } catch (error: any) {
      console.error('Error checking email worker health:', error.message);
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
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #007bff; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .link { color: #007bff; word-break: break-all; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Paper Dash!</h2>
            <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
            <p>
              <a href="${verificationLink}" class="button">
                Verify Email Address
              </a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p class="link">${verificationLink}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <div class="footer">
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
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
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #dc3545; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .link { color: #007bff; word-break: break-all; }
            .warning { 
              background-color: #fff3cd; 
              border-left: 4px solid #ffc107; 
              padding: 12px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the link below to create a new password:</p>
            <p>
              <a href="${resetLink}" class="button">
                Reset Password
              </a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p class="link">${resetLink}</p>
            <div class="warning">
              <strong>⏰ This link will expire in 1 hour.</strong>
            </div>
            <div class="footer">
              <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
              <p>For security reasons, we recommend changing your password if you didn't make this request.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Password Reset Request

We received a request to reset your password. Visit the link below to create a new password:

Reset link: ${resetLink}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

For security reasons, we recommend changing your password if you didn't make this request.
      `,
    };
  }

  /**
   * Generate welcome email template
   */
  generateWelcomeEmail(email: string, name: string): MailOptions {
    return {
      to: email,
      subject: 'Welcome to Paper Dash!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #007bff; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .features { margin: 20px 0; }
            .feature { margin: 10px 0; padding: 10px; background-color: #f8f9fa; border-radius: 5px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Paper Dash!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your account has been successfully verified! You're now ready to start using Paper Dash.</p>
              
              <div class="features">
                <div class="feature">📚 Access your courses and materials</div>
                <div class="feature">📊 Track your progress</div>
                <div class="feature">🤖 Use our Telegram bot for quick access</div>
                <div class="feature">📈 View your personalized dashboard</div>
              </div>

              <p style="text-align: center;">
                <a href="https://paperdash.katundu.org" class="button">
                  Go to Dashboard
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Need help? Contact us at support@paperapi.katundu.org</p>
              <p>&copy; ${new Date().getFullYear()} Paper Dash. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🎉 Welcome to Paper Dash!

Hi ${name},

Your account has been successfully verified! You're now ready to start using Paper Dash.

What you can do:
📚 Access your courses and materials
📊 Track your progress
🤖 Use our Telegram bot for quick access
📈 View your personalized dashboard

Visit your dashboard: https://paperdash.katundu.org

Need help? Contact us at support@paperapi.katundu.org

© ${new Date().getFullYear()} Paper Dash. All rights reserved.
      `,
    };
  }
}

export default MailService;
