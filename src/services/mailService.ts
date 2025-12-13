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
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Verify Your Email</title>
          <!--[if mso]>
          <style type="text/css">
            body, table, td { font-family: Arial, sans-serif !important; }
          </style>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                  
                  <!-- Header with Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                        Welcome to Paper Dash! 📚
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                        Hi there! 👋
                      </p>
                      <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Thank you for signing up. We're excited to have you on board! To get started, please verify your email address by clicking the button below.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);">
                              ✓ Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Expiry Notice -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                        <tr>
                          <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                              <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <p style="margin: 30px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 0; word-break: break-all; background-color: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <a href="${verificationLink}" style="color: #667eea; text-decoration: none; font-size: 13px;">${verificationLink}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 10px; color: #718096; font-size: 13px; line-height: 1.5; text-align: center;">
                        If you didn't create this account, you can safely ignore this email.
                      </p>
                      <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} Paper Dash. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Spacer -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 20px; text-align: center;">
                      <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                        Need help? Contact us at <a href="mailto:support@paperapi.katundu.org" style="color: #667eea; text-decoration: none;">support@paperapi.katundu.org</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Welcome to Paper Dash! 📚

Hi there! 👋

Thank you for signing up. We're excited to have you on board! To get started, please verify your email address by visiting the link below.

Verification link: ${verificationLink}

⏰ Important: This verification link will expire in 24 hours for security reasons.

If you didn't create this account, you can safely ignore this email.

Need help? Contact us at support@paperapi.katundu.org

© ${new Date().getFullYear()} Paper Dash. All rights reserved.
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
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Reset Your Password</title>
          <!--[if mso]>
          <style type="text/css">
            body, table, td { font-family: Arial, sans-serif !important; }
          </style>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                  
                  <!-- Header with Red/Orange Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                        🔐 Password Reset Request
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                        Hello,
                      </p>
                      <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        We received a request to reset the password for your Paper Dash account. Click the button below to create a new password:
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 14px rgba(245, 87, 108, 0.4);">
                              🔑 Reset My Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Security Warning -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                        <tr>
                          <td style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 6px;">
                            <p style="margin: 0 0 8px; color: #7f1d1d; font-size: 14px; line-height: 1.5; font-weight: 600;">
                              ⏰ Time Sensitive
                            </p>
                            <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                              This password reset link will expire in <strong>1 hour</strong> for your security.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <p style="margin: 30px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 0; word-break: break-all; background-color: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <a href="${resetLink}" style="color: #f5576c; text-decoration: none; font-size: 13px;">${resetLink}</a>
                      </p>
                      
                      <!-- Security Notice -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                        <tr>
                          <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px;">
                            <p style="margin: 0 0 8px; color: #78350f; font-size: 14px; line-height: 1.5; font-weight: 600;">
                              🛡️ Security Tip
                            </p>
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                              If you didn't request this password reset, please ignore this email. Your password will remain unchanged, but consider updating it if you suspect unauthorized access.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 10px; color: #718096; font-size: 13px; line-height: 1.5; text-align: center;">
                        This is an automated security email from Paper Dash.
                      </p>
                      <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} Paper Dash. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Spacer -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 20px; text-align: center;">
                      <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                        Need help? Contact us at <a href="mailto:support@paperapi.katundu.org" style="color: #f5576c; text-decoration: none;">support@paperapi.katundu.org</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
🔐 Password Reset Request

Hello,

We received a request to reset the password for your Paper Dash account. Visit the link below to create a new password:

Reset link: ${resetLink}

⏰ Time Sensitive: This password reset link will expire in 1 hour for your security.

🛡️ Security Tip: If you didn't request this password reset, please ignore this email. Your password will remain unchanged, but consider updating it if you suspect unauthorized access.

Need help? Contact us at support@paperapi.katundu.org

© ${new Date().getFullYear()} Paper Dash. All rights reserved.
      `,
    };
  }

  /**
   * Generate welcome email template
   */
  generateWelcomeEmail(email: string, name: string): MailOptions {
    return {
      to: email,
      subject: 'Welcome to Paper Dash! 🎉',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Welcome to Paper Dash</title>
          <!--[if mso]>
          <style type="text/css">
            body, table, td { font-family: Arial, sans-serif !important; }
          </style>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                  
                  <!-- Header with Celebration Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                      <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                        Welcome to Paper Dash!
                      </h1>
                      <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                        Your account is now active
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 18px; line-height: 1.6; font-weight: 600;">
                        Hi ${name}! 👋
                      </p>
                      <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Your account has been successfully verified! You're now ready to unlock the full potential of Paper Dash and streamline your academic journey.
                      </p>
                      
                      <!-- Features Section -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                        <tr>
                          <td style="padding: 0 0 15px 0;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; padding: 16px;">
                              <tr>
                                <td style="width: 40px; vertical-align: top;">
                                  <div style="font-size: 24px;">📚</div>
                                </td>
                                <td style="vertical-align: top;">
                                  <p style="margin: 0; color: #1a1a1a; font-size: 15px; font-weight: 600;">Access Your Courses</p>
                                  <p style="margin: 5px 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">View and organize all your course materials in one place</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="padding: 0 0 15px 0;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; padding: 16px;">
                              <tr>
                                <td style="width: 40px; vertical-align: top;">
                                  <div style="font-size: 24px;">📊</div>
                                </td>
                                <td style="vertical-align: top;">
                                  <p style="margin: 0; color: #1a1a1a; font-size: 15px; font-weight: 600;">Track Your Progress</p>
                                  <p style="margin: 5px 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">Monitor your academic performance and achievements</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="padding: 0 0 15px 0;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; padding: 16px;">
                              <tr>
                                <td style="width: 40px; vertical-align: top;">
                                  <div style="font-size: 24px;">🤖</div>
                                </td>
                                <td style="vertical-align: top;">
                                  <p style="margin: 0; color: #1a1a1a; font-size: 15px; font-weight: 600;">Telegram Bot Integration</p>
                                  <p style="margin: 5px 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">Get quick access and updates right from Telegram</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="padding: 0;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; padding: 16px;">
                              <tr>
                                <td style="width: 40px; vertical-align: top;">
                                  <div style="font-size: 24px;">📈</div>
                                </td>
                                <td style="vertical-align: top;">
                                  <p style="margin: 0; color: #1a1a1a; font-size: 15px; font-weight: 600;">Personalized Dashboard</p>
                                  <p style="margin: 5px 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">Your custom workspace tailored to your needs</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="https://paperdash.katundu.org" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);">
                              🚀 Go to Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Help Section -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                        <tr>
                          <td style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px;">
                            <p style="margin: 0 0 8px; color: #1e3a8a; font-size: 14px; line-height: 1.5; font-weight: 600;">
                              💡 Need Help Getting Started?
                            </p>
                            <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5;">
                              Our support team is here to help! Reach out anytime at <a href="mailto:support@paperapi.katundu.org" style="color: #3b82f6; text-decoration: none; font-weight: 600;">support@paperapi.katundu.org</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 10px; color: #718096; font-size: 13px; line-height: 1.5; text-align: center;">
                        Thank you for choosing Paper Dash to power your academic success! 🎓
                      </p>
                      <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} Paper Dash. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Social Links (Optional - Add if you have social media) -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 20px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #a0aec0; font-size: 12px;">
                        Follow us for updates and tips
                      </p>
                      <!-- Add your social media links here if needed -->
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
🎉 Welcome to Paper Dash!

Your account is now active

Hi ${name}! 👋

Your account has been successfully verified! You're now ready to unlock the full potential of Paper Dash and streamline your academic journey.

What you can do:

📚 Access Your Courses
View and organize all your course materials in one place

📊 Track Your Progress
Monitor your academic performance and achievements

🤖 Telegram Bot Integration
Get quick access and updates right from Telegram

📈 Personalized Dashboard
Your custom workspace tailored to your needs

🚀 Visit your dashboard: https://paperdash.katundu.org

💡 Need Help Getting Started?
Our support team is here to help! Reach out anytime at support@paperapi.katundu.org

Thank you for choosing Paper Dash to power your academic success! 🎓

© ${new Date().getFullYear()} Paper Dash. All rights reserved.
      `,
    };
  }
}

export default MailService;
