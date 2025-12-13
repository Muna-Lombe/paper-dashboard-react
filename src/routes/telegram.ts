import { InferSelectModel } from 'drizzle-orm';
import { telegramRegistrationRequests, tokens } from '../../drizzle/schema'; // Import Drizzle schema
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Markup, Telegraf } from 'telegraf';
import axios from 'axios';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { Env } from '..';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export type TelegramRegistrationRequest = InferSelectModel<typeof telegramRegistrationRequests>;

const telegramRoutes = new Hono<{ Bindings: Env; Variables: { drizzleDb: DrizzleD1Database; telegramBot: Telegraf<any>; }; }>();

// The requestMessages Map is specific to a Node.js server context and bot.telegram.deleteMessage.
// In a serverless Worker, this state management would need to be rethought (e.g., using durable objects or external storage).
// For now, commenting out as it's not directly compatible with Hono/Drizzle.
// const requestMessages = new Map();

const registerRequestSchema = z.object({
  chatId: z.string().nonempty("Chat ID is required"),
  email: z.string().email("Please include a valid email"),
  reasons: z.string().optional(),
  useCase: z.string().optional(),
});

// Endpoint for Telegram bot to send registration request data
telegramRoutes.post('/register-request',
  validator("json", (value, c) => {
    const parsed = registerRequestSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { chatId, email, reasons, useCase } = c.req.valid("json");

    try {
      const db = c.env.drizzleDb;
      
      // First, check if user exists with ANY status
      const existingRequest = await db.select().from(telegramRegistrationRequests).where(
        eq(telegramRegistrationRequests.chatId, chatId)
      );
      
      if (existingRequest.length > 0) {
        const existing = existingRequest[0];
        
        // If user is already approved, return their existing token/info
        if (existing.status === 'approved') {
          return c.json({ 
            msg: 'You are already registered and approved. Your token is available.', 
            requestId: existing.id,
            status: 'approved',
            hasToken: !!existing.apiToken,
            email: existing.email
          }, 200);
        }
        
        // If status is pending, update the existing request
        if (existing.status === 'pending') {
          await db.update(telegramRegistrationRequests).set({
            email,
            reasons,
            useCase,
          }).where(eq(telegramRegistrationRequests.id, existing.id));
          const updated = await db.select().from(telegramRegistrationRequests).where(
            eq(telegramRegistrationRequests.id, existing.id)
          );
          return c.json({ 
            msg: 'Registration request updated successfully.', 
            requestId: updated[0].id, 
            reasons, 
            useCase,
            status: updated[0].status
          }, 200);
        }
        
        // If status is rejected, allow them to create a new request by updating the rejected one
        if (existing.status === 'rejected') {
          await db.update(telegramRegistrationRequests).set({
            email,
            reasons,
            useCase,
            status: 'pending', // Reset to pending for re-review
          }).where(eq(telegramRegistrationRequests.id, existing.id));
          const updated = await db.select().from(telegramRegistrationRequests).where(
            eq(telegramRegistrationRequests.id, existing.id)
          );
          return c.json({ 
            msg: 'Registration request resubmitted successfully. It will be reviewed again.', 
            requestId: updated[0].id, 
            reasons, 
            useCase,
            status: updated[0].status
          }, 201);
        }
      }
      
      // No existing record, create a new one
      const newRequest = await db.insert(telegramRegistrationRequests).values({
        chatId,
        email,
        reasons,
        useCase,
        status: 'pending',
      }).returning();

      return c.json({ 
        msg: 'Registration request submitted successfully.', 
        requestId: newRequest[0].id, 
        reasons, 
        useCase,
        status: newRequest[0].status
      }, 201);
    } catch (err: any) {
      console.error('Registration error:', err.message);
      // Check if it's a unique constraint violation
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return c.json({ 
          msg: 'A registration request with this chat ID already exists. Please contact support if you need assistance.',
          error: 'DUPLICATE_CHAT_ID'
        }, 409);
      }
      return c.json({ msg: "Server error", error: err.message }, 500);
    }
  }
);

const approveRejectRequestSchema = z.object({
  registrationChatId: z.string().nonempty("Registration Chat ID is required"),
});

// Endpoint for bot master to approve registration requests
telegramRoutes.post('/approve-request',
  validator("json", (value, c) => {
    const parsed = approveRejectRequestSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { registrationChatId } = c.req.valid("json");

    try {
      const db = c.env.drizzleDb;
      const registrationRequest = await db.select().from(telegramRegistrationRequests).where(eq(telegramRegistrationRequests.chatId, registrationChatId));

      if (registrationRequest.length === 0) {
        return c.json({ msg: 'Registration request not found.' }, 404);
      }

      if (registrationRequest[0].status === 'approved') {
        return c.json({ msg: 'Registration request already approved.' }, 400);
      }
      
      await db.update(telegramRegistrationRequests).set({ status: 'approved' }).where(eq(telegramRegistrationRequests.id, registrationRequest[0].id));
      

     

      return c.json({ msg: 'Registration request approved successfully.', requestId: registrationRequest[0].id, email: registrationRequest[0].email }, 200);
    } catch (err: any) {
      console.error(err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  }
);

// Endpoint for bot master to reject registration requests
telegramRoutes.post('/reject-request',
  validator("json", (value, c) => {
    const parsed = approveRejectRequestSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { registrationChatId } = c.req.valid("json");

    try {
      const db = c.env.drizzleDb;
      const registrationRequest = await db.select().from(telegramRegistrationRequests).where(eq(telegramRegistrationRequests.chatId, registrationChatId));

      if (registrationRequest.length === 0) {
        return c.json({ msg: 'Registration request not found.' }, 404);
      }

      if (registrationRequest[0].status === 'rejected') {
        return c.json({ msg: 'Registration request already rejected.' }, 400);
      }

      await db.update(telegramRegistrationRequests).set({ status: 'rejected' }).where(eq(telegramRegistrationRequests.id, registrationRequest[0].id));

      
      return c.json({ msg: 'Registration request rejected.', email: registrationRequest[0].email }, 200);
    } catch (err: any) {
      console.error(err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  }
);

const generateProgressMeTokenSchema = z.object({
  chatId: z.string().nonempty("Chat ID is required"),
  progressMePassword: z.string().nonempty("ProgressMe password is required"),
});

// Endpoint for generating ProgressMe token after registration approval
telegramRoutes.post('/generate-progressme-token',
  validator("json", (value, c) => {
    const parsed = generateProgressMeTokenSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { chatId, progressMePassword } = c.req.valid("json");

    try {
      const db = c.env.drizzleDb;
      const registrationRequest = await db.select().from(telegramRegistrationRequests).where(eq(telegramRegistrationRequests.chatId, chatId));

      if (registrationRequest.length === 0) {
        return c.json({ msg: 'Registration request not found.' }, 404);
      }

      if (registrationRequest[0].status !== 'approved') {
        return c.json({ msg: 'Registration request not yet approved or already rejected.' }, 400);
      }

      const email = registrationRequest[0].email;
      
      // Use CourseScraperDurableObject for authentication instead of direct courseScraper
      // This is necessary because WebSocket connections need to be managed in a Durable Object
      if (!c.env.COURSE_SCRAPER_DO) {
        console.error('COURSE_SCRAPER_DO is not defined in environment variables.');
        return c.json({ msg: 'Scraper service not configured.' }, 500);
      }

      // Get or create a Durable Object instance for this user
      // Use email as the DO ID to maintain state per user
      const doId = c.env.COURSE_SCRAPER_DO.idFromName(email);
      const scraperDO = c.env.COURSE_SCRAPER_DO.get(doId);

      // Forward authentication request to the Durable Object
      // The DO routes based on pathname, so we use a simple URL with /authenticate path
      const doRequest = new Request('https://do-internal/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: progressMePassword,
          userId: registrationRequest[0].id, // Use registration request ID as userId
        }),
      });

      const doResponse = await scraperDO.fetch(doRequest as any);
      const scraperAuthResponse = await doResponse.json() as any;

      if (!doResponse.ok || !scraperAuthResponse.success) {
        console.error('ProgressMe authentication failed:', scraperAuthResponse.error);
        return c.json({ 
          msg: scraperAuthResponse.error || 'Failed to authenticate with ProgressMe. Please check your credentials.',
          error: scraperAuthResponse.error 
        }, 400);
      }

      const { token, response: authData } = scraperAuthResponse;
      const isProgressMeAuthSuccessful = token || null; 

      if (!isProgressMeAuthSuccessful) {
        return c.json({ msg: 'Invalid ProgressMe credentials.' }, 400);
      }

      const payload = {
        user: {
          id: registrationRequest[0].id, 
          email: email,
          // Remove password from payload - SECURITY VULNERABILITY
          // password: progressMePassword
        },
      };

      const serviceToken = await new Promise((resolve, reject) => {
        jwt.sign(
          payload,
          c.env.JWT_SECRET || "default_jwt_secret",
          { expiresIn: "5d" },
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          },
        );
      });

      await db.update(telegramRegistrationRequests).set({ apiToken: serviceToken as string }).where(eq(telegramRegistrationRequests.id, registrationRequest[0].id));
      await db.insert(tokens).values({
        tgRequestId: registrationRequest[0].id,
        token: serviceToken as string,
        // userId: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        isActive: true,
      });

      return c.json({ encodedToken: serviceToken }, 200);
    } catch (err: any) {
      console.error("generating token error:", err.message, err.stack);
      
      // Provide more specific error messages
      if (err.message && err.message.includes('WebSocket')) {
        return c.json({ 
          msg: 'WebSocket connection failed. This may be a temporary issue. Please try again later.',
          error: 'WEBSOCKET_ERROR'
        }, 500);
      }
      
      if (err.message && err.message.includes('timeout')) {
        return c.json({ 
          msg: 'Authentication timed out. Please check your credentials and try again.',
          error: 'TIMEOUT'
        }, 408);
      }
      
      if (err.message && err.message.includes('Token')) {
        return c.json({ 
          msg: 'Token generation failed. Please contact support if this issue persists.',
          error: 'TOKEN_GENERATION_ERROR'
        }, 500);
      }
      
      return c.json({ 
        msg: err.message || "Server error occurred while generating token. Please try again later.",
        error: err.message 
      }, 500);
    }
  }
);

export default telegramRoutes;
