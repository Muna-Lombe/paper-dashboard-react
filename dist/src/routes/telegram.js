import { telegramRegistrationRequests, tokens } from '../../drizzle/schema'; // Import Drizzle schema
import jwt from 'jsonwebtoken';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import courseScraper from '../../services/courseScraper';
const telegramRoutes = new Hono();
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
telegramRoutes.post('/register-request', validator("json", (value, c) => {
    const parsed = registerRequestSchema.safeParse(value);
    if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
}), async (c) => {
    const { chatId, email, reasons, useCase } = c.req.valid("json");
    try {
        const db = c.env.drizzleDb;
        let existingRequest = await db.select().from(telegramRegistrationRequests).where(and(eq(telegramRegistrationRequests.chatId, chatId), eq(telegramRegistrationRequests.status, "pending")));
        let registrationRequest;
        if (existingRequest.length > 0) {
            await db.update(telegramRegistrationRequests).set({
                email,
                reasons,
                useCase,
            }).where(eq(telegramRegistrationRequests.id, existingRequest[0].id));
            registrationRequest = { ...existingRequest[0], email, reasons, useCase };
        }
        else {
            const newRequest = await db.insert(telegramRegistrationRequests).values({
                chatId,
                email,
                reasons,
                useCase,
                status: 'pending',
            }).returning();
            registrationRequest = newRequest[0];
        }
        return c.json({ msg: 'Registration request submitted successfully.', requestId: registrationRequest.id, reasons, useCase }, 201);
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server error" }, 500);
    }
});
const approveRejectRequestSchema = z.object({
    registrationChatId: z.string().nonempty("Registration Chat ID is required"),
});
// Endpoint for bot master to approve registration requests
telegramRoutes.post('/approve-request', validator("json", (value, c) => {
    const parsed = approveRejectRequestSchema.safeParse(value);
    if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
}), async (c) => {
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
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server error" }, 500);
    }
});
// Endpoint for bot master to reject registration requests
telegramRoutes.post('/reject-request', validator("json", (value, c) => {
    const parsed = approveRejectRequestSchema.safeParse(value);
    if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
}), async (c) => {
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
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server error" }, 500);
    }
});
const generateProgressMeTokenSchema = z.object({
    chatId: z.string().nonempty("Chat ID is required"),
    progressMePassword: z.string().nonempty("ProgressMe password is required"),
});
// Endpoint for generating ProgressMe token after registration approval
telegramRoutes.post('/generate-progressme-token', validator("json", (value, c) => {
    const parsed = generateProgressMeTokenSchema.safeParse(value);
    if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
}), async (c) => {
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
        // WARNING: courseScraper uses puppeteer, which is not compatible with Cloudflare Workers.
        // This part of the code will still fail upon deployment to Cloudflare Workers.
        // It needs to be externalized to a separate service.
        const authResult = await courseScraper.authenticateWithWebSocket(email, progressMePassword);
        // const externalScraperUrl = c.env.EXTERNAL_SCRAPER_SERVICE_URL; // Access from Hono context
        // if (!externalScraperUrl) {
        //   console.error('EXTERNAL_SCRAPER_SERVICE_URL is not defined in environment variables.');
        //   return c.json({ msg: 'Scraper service not configured.' }, 500);
        // }
        // const scraperAuthResponse = await axios.post(`${externalScraperUrl}/authenticate`, {
        //   email,
        //   password: progressMePassword,
        // });
        // if (scraperAuthResponse.status !== 200 || !scraperAuthResponse.data) {
        //   return c.json({ msg: 'Failed to authenticate with external scraper service.' }, 400);
        // }
        const { token, data } = authResult;
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
            jwt.sign(payload, c.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "5d" }, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
        await db.update(telegramRegistrationRequests).set({ apiToken: serviceToken }).where(eq(telegramRegistrationRequests.id, registrationRequest[0].id));
        await db.insert(tokens).values({
            tgRequestId: registrationRequest[0].id,
            token: serviceToken,
            // userId: crypto.randomUUID(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            isActive: true,
        });
        return c.json({ encodedToken: serviceToken }, 200);
    }
    catch (err) {
        console.error("generating token error:", err.message);
        return c.json({ msg: "Server error" }, 500);
    }
});
export default telegramRoutes;
