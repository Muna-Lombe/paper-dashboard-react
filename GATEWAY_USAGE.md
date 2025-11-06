# Email Worker Gateway Usage Guide

The Email Worker exposes a Durable Object entry point that allows other Cloudflare Workers to send emails without managing credentials or configuration.

## Architecture

```
┌─────────────────────────┐
│   External Worker       │
│  (Your App/Service)     │
└────────────┬────────────┘
             │
             │ fetch to /gateway/send
             │
┌────────────▼────────────┐
│  Email Service Gateway  │
│   (Durable Object)      │
│                         │
│ - Rate limiting         │
│ - Request routing       │
│ - Config access         │
└────────────┬────────────┘
             │
             │ Internal fetch
             │
┌────────────▼────────────┐
│   Email Worker          │
│   (Main Service)        │
│                         │
│ - Mailgun/MailChannels  │
│ - Authentication        │
│ - Dashboard             │
└─────────────────────────┘
```

## Setup

### 1. In Your External Worker's `wrangler.toml`:

```toml
# Add the service binding to the email-worker
[[services]]
binding = "EMAIL_WORKER"
service = "email-gateway"
environment = "production"  # or your chosen environment
```

### 2. In Your External Worker's Code:

```typescript
import EmailServiceClient from "email-worker/durableObjects/EmailServiceClient";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Initialize the client
    const emailClient = new EmailServiceClient(env.EMAIL_WORKER_GATEWAY);

    // Send an email
    const result = await emailClient.sendEmail({
      to: "user@example.com",
      subject: "Hello from Worker",
      html: "<p>This is an email sent via the gateway!</p>",
      text: "This is an email sent via the gateway!",
      from: "noreply@example.com",
    });

    if (result.success) {
      return new Response(
        JSON.stringify({ message: "Email sent!", messageId: result.messageId }),
        { status: 200 }
      );
    } else {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
      });
    }
  },
};
```

## API Methods

### `sendEmail(options: SendEmailOptions): Promise<SendEmailResponse>`

Send an email through the gateway.

**Parameters:**
```typescript
{
  to: string | string[];           // Recipient email(s)
  subject: string;                  // Email subject
  html?: string;                    // HTML content
  text?: string;                    // Plain text content
  from?: string;                    // Sender email (optional)
}
```

**Returns:**
```typescript
{
  success: boolean;
  messageId?: string;               // Returned on success
  error?: string;                   // Returned on error
}
```

### `getConfig(): Promise<Record<string, unknown>>`

Get the current email configuration.

```typescript
const config = await emailClient.getConfig();
console.log(config.provider); // "mailgun" | "mailchannels" | "auto"
```

### `checkRateLimit(email: string): Promise<RateLimitInfo>`

Check rate limit status for a sender.

```typescript
const rateLimitInfo = await emailClient.checkRateLimit("user@example.com");
console.log(rateLimitInfo.allowed);    // boolean
console.log(rateLimitInfo.remaining);  // number of requests left
console.log(rateLimitInfo.resetTime);  // timestamp when limit resets
```

### `health(): Promise<HealthStatus>`

Check the health of the gateway.

```typescript
const health = await emailClient.health();
console.log(health.status);        // "healthy"
console.log(health.requestCount);  // number of requests processed
console.log(health.timestamp);     // ISO timestamp
```

## HTTP API

You can also make direct HTTP requests to the gateway:

### Send Email (HTTP)

```bash
POST /gateway/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Test Email",
  "html": "<p>Hello</p>",
  "text": "Hello"
}
```

### Get Configuration

```bash
GET /gateway/config
```

### Check Rate Limit

```bash
POST /gateway/rate-limit-check
Content-Type: application/json

{
  "email": "sender@example.com"
}
```

### Health Check

```bash
GET /gateway/health
```

## Error Handling

```typescript
const result = await emailClient.sendEmail({
  to: "user@example.com",
  subject: "Test",
  text: "Test",
});

if (!result.success) {
  console.error("Failed to send email:", result.error);
  // Handle error appropriately
}
```

## Rate Limiting

The gateway implements a basic rate limit of **100 requests per hour** per Durable Object instance.

For production deployments with high email volume, consider:
1. Using multiple Durable Object instances with different singleton names
2. Implementing KV-backed rate limiting for distributed rate limiting
3. Using a load balancer to distribute across multiple instances

## Examples

### Example 1: Send Welcome Email

```typescript
const client = new EmailServiceClient(env.EMAIL_GATEWAY);

await client.sendEmail({
  to: newUser.email,
  subject: "Welcome to Our App!",
  html: `
    <h1>Welcome ${newUser.name}!</h1>
    <p>Your account has been created.</p>
    <a href="https://app.example.com/verify">Verify Email</a>
  `,
  text: `Welcome ${newUser.name}! Your account has been created.`,
  from: "welcome@app.example.com",
});
```

### Example 2: Batch Email with Rate Limiting

```typescript
const client = new EmailServiceClient(env.EMAIL_GATEWAY);

for (const user of users) {
  // Check rate limit before sending
  const rateLimitInfo = await client.checkRateLimit("notifications@app.example.com");

  if (!rateLimitInfo.allowed) {
    console.log("Rate limit reached, waiting...");
    // Wait before retrying
    break;
  }

  const result = await client.sendEmail({
    to: user.email,
    subject: "Weekly Newsletter",
    html: renderNewsletter(user),
    from: "notifications@app.example.com",
  });

  if (!result.success) {
    console.error(`Failed to send email to ${user.email}:`, result.error);
  }
}
```

### Example 3: Conditional Sending Based on Config

```typescript
const client = new EmailServiceClient(env.EMAIL_GATEWAY);

// Get current provider configuration
const config = await client.getConfig();

// Only send if configured
if (!config.provider || config.provider === "auto") {
  console.log("Email provider not configured");
  return;
}

const result = await client.sendEmail({
  to: "admin@example.com",
  subject: "System Alert",
  text: "An important event occurred",
});
```

## Troubleshooting

### "No token provided"
- Ensure the email-worker is deployed
- Check that the service binding in `wrangler.toml` is correct

### "Configuration not found"
- Visit the Email Worker dashboard at `/dashboard`
- Configure an email provider (Mailgun or MailChannels)
- Save the configuration

### Rate Limit Exceeded
- Wait for the rate limit window to reset (1 hour)
- Consider distributing emails over time
- For high volume, use multiple singleton instances

### Durable Object Not Found
- Ensure `wrangler.toml` has the correct migrations section
- Run `wrangler deploy` to initialize the Durable Object
- Check that `[[durable_objects.bindings]]` is configured correctly

## Security Considerations

1. **No Authentication Required**: The gateway currently doesn't require authentication. Implement rate limiting at the source worker level if needed.

2. **Service Bindings Only**: Use service bindings (not public endpoints) to communicate between workers for security.

3. **Input Validation**: Validate all email inputs before sending.

4. **Rate Limiting**: Monitor rate limits to prevent abuse.

## Production Recommendations

1. **Monitoring**: Add logging and monitoring to track email delivery
2. **Retries**: Implement retry logic with exponential backoff
3. **Dead Letter Queue**: Store failed emails for later retry
4. **Metrics**: Track delivery rates, failure rates, and latency
5. **Multiple Instances**: Use multiple gateway instances for redundancy
6. **KV-backed Rate Limiting**: Use KV storage for distributed rate limiting across instances

