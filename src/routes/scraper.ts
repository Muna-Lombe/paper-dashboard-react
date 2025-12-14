import { InferSelectModel } from 'drizzle-orm';
import { telegramRegistrationRequests, tokens } from '../../drizzle/schema'; // Import Drizzle schema
import { auth, AuthVariables } from "../middleware/auth"; // Updated import for auth middleware
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Hono, Context, Next } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { getCookie, setCookie } from 'hono/cookie';
import axios from 'axios';
// import courseScraper from "../../services/courseScraper.js"; // No longer needed - using Durable Object instead
import { eq, and } from 'drizzle-orm';
import { Env } from '..'; // Import Env interface
import { User } from '../database/models/User'; // Import User interface
import { apiTokenAuth } from '../middleware/scraper'; // Import the new middleware
import { LogHogClient } from '../services/loggerService'; // Import LogHog client

export type TelegramRegistrationRequest = InferSelectModel<typeof telegramRegistrationRequests>;

const scraperRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables & { apiUser: { chatId: string; email: string; apiToken: string | null; }; }; }>(); // Updated Hono context to include AuthVariables

/**
 * Helper function to get the Course Scraper Durable Object stub for a user
 */
function getScraperDO(c: Context<{ Bindings: Env; Variables: AuthVariables & { apiUser: { chatId: string; email: string; apiToken: string | null; }; } }>, userId: string) {
    const doId = c.env.COURSE_SCRAPER_DO.idFromName(userId);
    return c.env.COURSE_SCRAPER_DO.get(doId);
}

// Swagger documentation comments are not directly supported with Hono in this setup.
// They should be moved to a separate documentation generation process or removed.
// /**
//  * @swagger
//  * tags:
//  *   name: Scraper
//  *   description: Course scraping and importing functionality
//  */

// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     ScrapedCourse:
//  *       type: object
//  *       properties:
//  *         bookId:
//  *           type: string
//  *           description: The ID of the book in ProgressMe
//  *         userId:
//  *           type: string
//  *           description: The user ID in ProgressMe
//  *         token:
//  *           type: string
//  *           description: Authentication token for ProgressMe
//  */

const validateUrlSchema = z.object({
  url: z.string().url("URL is required").nonempty("URL is required"),
});

// /**
// * @swagger
// * /api/scraper/validate-url:
// *   post:
// *     summary: Validate and clean a course URL
// *     tags: [Scraper]
// *     security:
// *       - apiTokenAuth: []
// *     requestBody:
// *       required: true
// *       content:
// *         application/json:
// *           schema:
// *             type: object
// *             required:
// *               - url
// *             properties:
// *               url:
// *                 type: string
// *                 description: The URL to validate
// *     responses:
// *       200:
// *         description: URL validated successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 url:
// *                   type: string
// *       400:
// *         description: Invalid URL
// *       401:
// *         description: Unauthorized - Missing or invalid API token
// *       500:
// *         description: Server error
// */
scraperRoutes.post(
    "/validate-url",
    auth,
    // apiTokenAuth, // Use Hono-compatible API token middleware
    validator("json", (value, c) => {
      const parsed = validateUrlSchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
      }
      return parsed.data;
    }),
    async (c) => {
        const { url } = c.req.valid("json");
        const user = c.get('user');
        const apiUser = c.get('apiUser');
        const traceId = (c as any).traceId;
        const spanId = (c as any).spanId;
        
        // Initialize logger
        const logger = c.env.LOG_API && c.env.LOGHOG_APP_TOKEN
            ? new LogHogClient(c.env.LOG_API, c.env.LOGHOG_APP_TOKEN, c.executionCtx.waitUntil.bind(c.executionCtx))
            : null;

        try {
            logger?.info('Scraper URL validation requested', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/validate-url' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });
            
            // Use Durable Object for URL validation
            const scraperDO = getScraperDO(c, user.id);
            const doRequest = new Request(`https://do-internal/validate-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const doResponse = await scraperDO.fetch(doRequest as any);
            const doResult = await doResponse.json() as any;

            if (!doResponse.ok) {
                logger?.error('URL validation failed', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                        error: doResult.error || doResult.message
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'ERROR', params: { statusCode: doResponse.status, method: 'POST', path: '/scraper/validate-url' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: doResult.error || 'URL validation failed' }, doResponse.status as any);
            }

            const response = doResult.valid;
            if (!response) {
                logger?.warn('URL validation failed', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                    
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'WARN', params: { statusCode: 400, method: 'POST', path: '/scraper/validate-url' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: 'Failed to validate URL with external scraper service.' }, 400);
            }
            const validUrl = response; 
            if (!validUrl) {
                logger?.warn('Invalid course URL', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'WARN', params: { statusCode: 400, method: 'POST', path: '/scraper/validate-url' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: "Invalid course URL" }, 400);
            }

            logger?.info('URL validated successfully', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                    url: url,
                    validUrl: validUrl,
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/validate-url' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });

            return c.json({ url: validUrl });
        } catch (err: any) {
            console.error(err.message);
            logger?.error('Error validating URL', {
                
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                    error: err.message,
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'ERROR', params: { statusCode: 500, method: 'POST', path: '/scraper/validate-url' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });
            return c.json({ msg: "Server Error" }, 500);
        }
    },
);

const scraperAuthSchema = z.object({
  apiToken: z.string().nonempty("API token is required"),
});
type ScraperAuthData = z.infer<typeof scraperAuthSchema>; // Define a type for the validated data

// /**
// * @swagger
// * /api/scraper/auth:
// *   post:
// *     summary: Authenticate with ProgressMe
// *     tags: [Scraper]
// *     security:
// *       - apiTokenAuth: []
// *     requestBody:
// *       required: true
// *       content:
// *         application/json:
// *           schema:
// *             type: object
// *             required:
// *               - email
// *               - password
// *             properties:
// *               email:
// *                 type: string
// *                 format: email
// *               password:
// *                 type: string
// *     responses:
// *       200:
// *         description: Authentication successful
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 token:
// *                   type: string
// *                 data:
// *                   type: object
// *       400:
// *         description: Invalid credentials
// *       401:
// *         description: Unauthorized - Missing or invalid API token
// *       500:
// *         description: Authentication failed
// */
scraperRoutes.post(
    "/getUserInfo", // Renamed back to /auth as per original description
    auth,
    // apiTokenAuth, // Use Hono-compatible API token middleware
    validator("json", (value, c) => {
      const parsed = scraperAuthSchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
      }
      return parsed.data;
    }),
    async (c) => {
        const { apiToken } = c.req.valid("json") as ScraperAuthData;
        const user = c.get('user');
        const apiUser = c.get('apiUser');
        const traceId = (c as any).traceId;
        const spanId = (c as any).spanId;

        // Initialize logger
        const logger = c.env.LOG_API && c.env.LOGHOG_APP_TOKEN
            ? new LogHogClient(c.env.LOG_API, c.env.LOGHOG_APP_TOKEN, c.executionCtx.waitUntil.bind(c.executionCtx))
            : null;

        try {
            logger?.info('ProgressMe authentication requested', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/getUserInfo' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });

            const decoded = jwt.verify(apiToken, c.env.JWT_SECRET || "default_jwt_secret") as JwtPayload;

            if (!decoded || !decoded.user || !decoded.user.email) {
                logger?.warn('Invalid API token provided', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'WARN', params: { statusCode: 400, method: 'POST', path: '/scraper/getUserInfo' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: "Invalid Credentials" }, 400);
            }
            const { email, authToken, password, progressmeUserData:puInfo } = decoded.user;
            
            // Get the Durable Object for this user
            const scraperDO = getScraperDO(c, user.id);
            
            if(!authToken && password){

                // Authenticate via Durable Object
                const doRequest = new Request(`https://do-internal/authenticate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, userId: user.id }),
                });
                
                const doResponse = await scraperDO.fetch(doRequest as any);
                const scraperAuthResponse = await doResponse.json() as any;
    
                if (!doResponse.ok || !scraperAuthResponse.success) {
                    logger?.error('ProgressMe authentication failed', {
                        body: {
                            userId: user?.id,
                            authParams: {
                                email,
                                password
                            },
                            chatId: apiUser?.chatId,
                            error: scraperAuthResponse.error,
    
                        },
                        source_ip: c.req.url,
                        category: 'scraper',
                        trace_id: traceId,
                        span_id: spanId,
                        template: { name: 'ERROR', params: { statusCode: 400, method: 'POST', path: '/scraper/getUserInfo' } },
                        tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                    });
                    return c.json({ msg: 'Failed to authenticate with external scraper service.' }, 400);
                }
                
                const { token, response: authData } = scraperAuthResponse;
                // associate telegram registration request with user
                const db = c.env.drizzleDb as any;
                await db.update(tokens).set({ userId: authData.Value.Id }).where(eq(tokens.token as any, apiToken));
                logger?.info('ProgressMe authentication successful', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/getUserInfo' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ token, data: { puid: authData.Value.Id, role: authData.Value.AccountRole } });

            }

            
            logger?.info('ProgressMe authentication successful', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/getUserInfo' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });
            return c.json({ token:authToken, data: { puid: puInfo.Id, role: puInfo.role } });

        } catch (err: any) {
            console.error(err.message);
            logger?.error('Error authenticating with ProgressMe', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'ERROR', params: { statusCode: 500, method: 'POST', path: '/scraper/getUserInfo' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });
            return c.json({ msg: "Authentication failed" }, 500);
        }
    },
);

// /**
// * @swagger
// * /api/scraper/getbook?code:
// *   get:
// *     summary: Get a book by code
// *     tags: [Scraper]
// *     security:
// *       - apiTokenAuth: []
// *     parameters:
// *       - in: query
// *         name: code
// *         schema:
// *           type: string
// *         required: true
// *         description: The book code
// *     responses:
// *       200:
// *         description: Book found
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 book:
// *                   $ref: '#/components/schemas/ScrapedCourse'
// *       400:
// *         description: Invalid book code
// *       401:
// *         description: Unauthorized - Missing or invalid API token
// *       500:
// *         description: Server error
// *       503:
// *         description: Book not found
// *       504:
// *         description: Book not found
// *     components:
// *       schemas:
// *         ScrapedCourse:
// *           type: object
// *           properties:
// *             bookId:
// *               type: string
// *               description: The ID of the book in ProgressMe
// *             bookName:
// *               type: string
// *               description: The name of the book
// *
// */
scraperRoutes.get("/getbook",
    auth, 
    // apiTokenAuth, 
    async (c) => {
    const user = c.get('user');
    const apiUser = c.get('apiUser');
    const traceId = (c as any).traceId;
    const spanId = (c as any).spanId;

    // Initialize logger
    const logger = c.env.LOG_API && c.env.LOGHOG_APP_TOKEN
        ? new LogHogClient(c.env.LOG_API, c.env.LOGHOG_APP_TOKEN, c.executionCtx.waitUntil.bind(c.executionCtx))
        : null;

    try {
        const url = c.req.query("url"); // Get URL from query params
        if (!url) {
            logger?.warn('Get book request missing URL parameter', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'WARN', params: { statusCode: 400, method: 'POST', path: '/scraper/getBook' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });
            return c.json({ message: "URL query parameter is required" }, 400);
        }
        const decodedUrl = atob(url);
        
        logger?.info('Get book request', {
            body: {
                userId: user?.id,
                chatId: apiUser?.chatId,
            },
            source_ip: c.req.url,
            category: 'scraper',
            trace_id: traceId,
            span_id: spanId,
            template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/getBook' } },
            tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
        });

        const bookIdRegex = /\/book\/(\d+)/;
        let book = {};

        if (decodedUrl.includes("book/")) {
            const match = decodedUrl.match(bookIdRegex);
            if (!match) {
                logger?.warn('Invalid book URL format', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                        decodedUrl
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'WARN', params: { statusCode: 400, method: 'POST', path: '/scraper/getBook' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: "Invalid book URL format" }, 400);
            }
            const bookId = match[1].split("/")[0];
            
            logger?.info('Fetching book by ID', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                    bookId
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/getBook' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });

            // Use Durable Object to get book by ID
            const scraperDO = getScraperDO(c, user.id);
            const doRequest = new Request(`https://do-internal/get-book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId: Number(bookId) }),
            });

            const doResponse = await scraperDO.fetch(doRequest as any);
            const response = await doResponse.json() as any;

            if (!doResponse.ok) {
                logger?.error('Failed to get book', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                        bookId,
                        error: response.error || response.message
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'ERROR', params: { statusCode: doResponse.status, method: 'POST', path: '/scraper/getBook' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: response.error || response.message || 'Failed to get book' }, doResponse.status as any);
            }

            if (!response || !response.bookName) {
                logger?.error('Failed to get book', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                        bookId,
                        error: response.error || response.message
                        
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'ERROR', params: { statusCode: 404, method: 'POST', path: '/scraper/getBook' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: 'Failed to get book from external scraper service.' }, 404);
            }
            book = response;
            
            logger?.info('Book retrieved successfully', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                    bookName: response.bookName
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/getBook' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });

            return c.json(book);
        }

        if (
            decodedUrl.includes("sharing-material/") ||
            decodedUrl.includes("SharingMaterial/")
        ) {
            const bookCode =
                decodedUrl.split("sharing-material/")[1] ??
                decodedUrl.split("SharingMaterial/")[1];
            
            logger?.info('Fetching book by code', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                    bookCode
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/getBook' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });

            // Use Durable Object to get book by code
            const scraperDO = getScraperDO(c, user.id);
            const doRequest = new Request(`https://do-internal/get-book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookCode }),
            });

            const doResponse = await scraperDO.fetch(doRequest as any);
            const response = await doResponse.json() as any;

            if (!doResponse.ok) {
                logger?.error('Failed to get book', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                        bookCode,
                        error: response.error || response.message
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'ERROR', params: { statusCode: doResponse.status, method: 'POST', path: '/scraper/getBook' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: response.error || response.message || 'Failed to get book' }, doResponse.status as any);
            }

            if (!response || !response.bookName) {
                logger?.error('Failed to get book', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                        bookCode,
                        error: response.error || response.message
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'ERROR', params: { statusCode: 404, method: 'POST', path: '/scraper/getBook' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: 'Failed to get book from external scraper service.' }, 404);
            }
            book = response;
            
            logger?.info('Book retrieved successfully', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                    bookName: response.bookName
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/getBook' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });

            return c.json(book);
        }

        logger?.error('Book not found - invalid URL format', {
            body: {
                userId: user?.id,
                chatId: apiUser?.chatId,
                decodedUrl
            },
            source_ip: c.req.url,
            category: 'scraper',
            trace_id: traceId,
            span_id: spanId,
            template: { name: 'WARN', params: { statusCode: 404, method: 'POST', path: '/scraper/getBook' } },
            tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
        });

        return c.json({ message:"book not found" }, 404);
    } catch (err: any) {
        // console.error(err.message);
        logger?.error('Error getting book', {
            body: {
                userId: user?.id,
                chatId: apiUser?.chatId,
                error: err?.message || "No specific error, check scraper logs"
            },
            source_ip: c.req.url,
            category: 'scraper',
            trace_id: traceId,
            span_id: spanId,
            template: { name: 'WARN', params: { statusCode: 500, method: 'POST', path: '/scraper/getBook' } },
            tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
        });
        return c.json({ msg: "Server Error" }, 500);
    }
});

const copyCourseSchema = z.object({
  bookId: z.string().nonempty("Book ID is required"),
  userId: z.string().nonempty("User ID is required"),
  // token: z.string().nonempty("Token is now derived from apiTokenAuth"), // Token is now derived from apiTokenAuth
});

// /**
// * @swagger
// * /api/scraper/copy-course:
// *   post:
// *     summary: Copy a course using WebSocket
// *     tags: [Scraper]
// *     security:
// *       - apiTokenAuth: []
// *     requestBody:
// *       required: true
// *       content:
// *         application/json:
// *           schema:
// *             type: object
// *             required:
// *               - bookId
// *               - userId
// *               - token
// *             properties:
// *               bookId:
// *                 type: string
// *               userId:
// *                 type: string
// *               token:
// *                 type: string
// *     responses:
// *       200:
// *         description: Course copied successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 success:
// *                   type: boolean
// *                 message:
// *                   type: string
// *       400:
// *         description: Missing required information
// *       401:
// *         description: Unauthorized - Missing or invalid API token
// *       500:
// *         description: Failed to copy course
// */
scraperRoutes.post(
    "/copy-course",
    auth,
    // apiTokenAuth, // Use Hono-compatible API token middleware
    validator("json", (value, c) => {
      const parsed = copyCourseSchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
      }
      return parsed.data;
    }),
    async (c) => {
        const { bookId, userId } = c.req.valid("json");
        const user = c.get('user');
        const apiUser = c.get('apiUser'); // Get apiUser from Hono context
        const token = apiUser.apiToken; // Use the stored API token
        const traceId = (c as any).traceId;
        const spanId = (c as any).spanId;

        // Initialize logger
        const logger = c.env.LOG_API && c.env.LOGHOG_APP_TOKEN
            ? new LogHogClient(c.env.LOG_API, c.env.LOGHOG_APP_TOKEN, c.executionCtx.waitUntil.bind(c.executionCtx))
            : null;

        try {
            logger?.info('Copy course requested', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/copy-course' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });

            // Use Durable Object to check if book can be shared
            const scraperDO = getScraperDO(c, user.id);
            const checkCanShareRequest = new Request(`https://do-internal/check-can-share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    bookId: Number(bookId), 
                    userId: Number(userId),
                    token: token || ""
                }),
            });

            const checkCanShareResponse = await scraperDO.fetch(checkCanShareRequest as any);
            const checkCanShareResult = await checkCanShareResponse.json() as any;

            if (!checkCanShareResponse.ok) {
                logger?.error('Failed to check if book can be shared', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                        bookId,
                        error: checkCanShareResult.error || checkCanShareResult.message
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'ERROR', params: { statusCode: checkCanShareResponse.status, method: 'POST', path: '/scraper/copy-course' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: checkCanShareResult.error || 'Failed to check sharing status' }, checkCanShareResponse.status as any);
            }

            const canBookBeShared = checkCanShareResult.canShare;
            console.log("book can be share:", canBookBeShared);
                
            if (canBookBeShared) {
                logger?.info('Book can be shared, setting sharing material ID', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/copy-course' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });

                // Use Durable Object to set sharing material ID
                const setSharingRequest = new Request(`https://do-internal/set-sharing-material`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        bookId: Number(bookId),
                        token: token || ""
                    }),
                });

                const setSharingResponse = await scraperDO.fetch(setSharingRequest as any);
                const setSharingResult = await setSharingResponse.json() as any;

                if (!setSharingResponse.ok || !setSharingResult.success) {
                    logger?.error('Failed to set sharing material ID', {
                        body: {
                            userId: user?.id,
                            chatId: apiUser?.chatId,
                            bookId,
                            error: setSharingResult.error || setSharingResult.message
                        },
                        source_ip: c.req.url,
                        category: 'scraper',
                        trace_id: traceId,
                        span_id: spanId,
                        template: { name: 'ERROR', params: { statusCode: setSharingResponse.status, method: 'POST', path: '/scraper/copy-course' } },
                        tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                    });
                    return c.json({ msg: setSharingResult.error || 'Failed to set sharing material ID' }, (setSharingResponse.status || 400) as any);
                }

                const sharingMaterialId = setSharingResult.sharingMaterialId;

                if (!sharingMaterialId) {
                    logger?.error('Failed to set sharing material ID', {
                        body: {
                            userId: user?.id,
                            chatId: apiUser?.chatId,
                            error: {message: "external scraper failed"}
                        },
                        source_ip: c.req.url,
                        category: 'scraper',
                        trace_id: traceId,
                        span_id: spanId,
                        template: { name: 'ERROR', params: { statusCode: 400, method: 'POST', path: '/scraper/getUserInfo' } },
                        tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                    } );
                    return c.json({ msg: 'Failed to set sharing material ID from external scraper service.' }, 400);
                }

                logger?.info('Sharing material ID set successfully', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/copy-course' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
            } else {
                logger?.warn('Book cannot be shared', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'WARN', params: { statusCode: 400, method: 'POST', path: '/scraper/copy-course' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                console.log("\ncannot share. won't try to copy");
                return c.json({ msg: "Book cannot be shared" }, 400);
            }

            logger?.info('Copying course', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/copy-course' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });

            // Use Durable Object to copy course
            const copyCourseRequest = new Request(`https://do-internal/copy-course`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    bookId: Number(bookId),
                    userId: Number(userId),
                    token: token || ""
                }),
            });

            const copyCourseDoResponse = await scraperDO.fetch(copyCourseRequest as any);
            const copyCourseResponse = await copyCourseDoResponse.json() as any;

            if (!copyCourseDoResponse.ok || !copyCourseResponse.success) {
                logger?.error('Failed to copy course', {
                    body: {
                        userId: user?.id,
                        chatId: apiUser?.chatId,
                        error:{message: "external scraper failed"}
                    },
                    source_ip: c.req.url,
                    category: 'scraper',
                    trace_id: traceId,
                    span_id: spanId,
                    template: { name: 'ERROR', params: { statusCode: 400, method: 'POST', path: '/scraper/copy-course' } },
                    tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
                });
                return c.json({ msg: 'Failed to copy course with external scraper service.' }, 400);
            }
            
            const result = copyCourseResponse.result;
            
            logger?.info('Course copied successfully', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/scraper/copy-course' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });

            return c.json(result);
        } catch (err: any) {
            console.error(err.message);
            logger?.error('Error copying course', {
                body: {
                    userId: user?.id,
                    chatId: apiUser?.chatId,
                    error: {message: err.message}
                },
                source_ip: c.req.url,
                category: 'scraper',
                trace_id: traceId,
                span_id: spanId,
                template: { name: 'INFO', params: { statusCode: 500, method: 'POST', path: '/scraper/copy-course' } },
                tags: { "service": "paper-dash-api", "region": "eu-west-1", "env": c.env.NODE_ENV }
            });

            return c.json({ msg: "Server Error" }, 500);
        }
    },
);

// Removed the /token endpoint and its Swagger documentation as it's no longer needed.

export default scraperRoutes;
