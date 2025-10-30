import { InferSelectModel } from 'drizzle-orm';
import { telegramRegistrationRequests } from '../../drizzle/schema'; // Import Drizzle schema
import auth from "../middleware/auth";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Hono, Context, Next } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { getCookie, setCookie } from 'hono/cookie';
import axios from 'axios';
import courseScraper from "../../services/courseScraper";
import { eq, and } from 'drizzle-orm';
import { Env } from '..'; // Import Env interface
import { User } from '../database/models/User'; // Import User interface

export type TelegramRegistrationRequest = InferSelectModel<typeof telegramRegistrationRequests>;

const scraperRoutes = new Hono<{ Bindings: Env; Variables: { apiUser: { chatId: string; email: string; apiToken: string | null; }; }; }>();

// API Token Authentication Middleware
const apiTokenAuth = async (c: Context<{ Bindings: Env; Variables: { apiUser: { chatId: string; email: string; apiToken: string | null; }; }; }>, next: Next) => {
    const apiToken = getCookie(c, "api-token") || c.req.header("x-api-token");

    if (!apiToken) {
        return c.json({ msg: "No API token, authorization denied for scraper access." }, 401);
    }

    try {
        const db = c.env.drizzleDb;
        const registrationRequest = await db.select().from(telegramRegistrationRequests).where(and(eq(telegramRegistrationRequests.apiToken, apiToken), eq(telegramRegistrationRequests.status, 'approved'))).limit(1);

        if (registrationRequest.length === 0) {
            return c.json({ msg: "Invalid or expired API token for scraper access." }, 401);
        }

        c.set('apiUser', {
            chatId: registrationRequest[0].chatId,
            email: registrationRequest[0].email,
            apiToken: registrationRequest[0].apiToken,
        } as { chatId: string; email: string; apiToken: string | null; });
        await next();
    } catch (err: any) {
        console.error("API Token Auth middleware error:", err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
};

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
    apiTokenAuth, // Use Hono-compatible API token middleware
    validator("json", (value, c) => {
      const parsed = validateUrlSchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
      }
      return parsed.data;
    }),
    async (c) => {
        const { url } = c.req.valid("json");
       
        try {
            const response = await courseScraper.validateUrl(url);
            if (!response) {
              return c.json({ msg: 'Failed to validate URL with external scraper service.' }, 400);
            }
            const validUrl = response; 
            if (!validUrl) {
                return c.json({ msg: "Invalid course URL" }, 400);
            }
            return c.json({ url: validUrl });
        } catch (err: any) {
            console.error(err.message);
            return c.json({ msg: "Server Error" }, 500);
        }
    },
);

const scraperAuthSchema = z.object({
  apiToken: z.string().nonempty("API token is required"),
});

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
    apiTokenAuth, // Use Hono-compatible API token middleware
    validator("json", (value, c) => {
      const parsed = scraperAuthSchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
      }
      return parsed.data;
    }),
    async (c) => {
        const { apiToken } = c.req.valid("json");
        

        try {
            const decoded = jwt.verify(apiToken, c.env.JWT_SECRET || "default_jwt_secret") as JwtPayload;

            if (!decoded || !decoded.user || !decoded.user.email) { 
                return c.json({ msg: "Invalid Credentials" }, 400);
            }
            const { email, password } = decoded.user;
            
            // The actual ProgressMe password is NOT stored in our JWT for security.
            // If the external scraper needs it, it must be provided separately by the user.
            // For this `/auth` endpoint, we assume the API token is enough for the external scraper to proceed.
            // If the external scraper requires the password for subsequent actions, it needs to be handled differently.
            const scraperAuthResponse = await courseScraper.authenticateWithWebSocket(email, password);

            if (scraperAuthResponse.status !== 200 || !scraperAuthResponse.data) {
                return c.json({ msg: 'Failed to authenticate with external scraper service.' }, 400);
            }
            const { token, data } = scraperAuthResponse.data; // token here refers to the ProgressMe token, not our API token

            return c.json({ token, data: { puid: data.Value.Id, role: data.Value.AccountRole } });
        } catch (err: any) {
            console.error(err.message);
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
scraperRoutes.get("/getbook", apiTokenAuth, async (c) => {
    try {
        const url = c.req.query("url"); // Get URL from query params
        if (!url) {
          return c.json({ message: "URL query parameter is required" }, 400);
        }
        const decodedUrl = atob(url);
        // console.log("decoded", decodedUrl);
        
        

        const bookIdRegex = /\/book\/(\d+)/;
        let book = {};

        if (decodedUrl.includes("book/")) {
            const match = decodedUrl.match(bookIdRegex);
            if (!match) {
                return c.json({ msg: "Invalid book URL format" }, 400);
            }
            const bookId = match[1].split("/")[0];
            const response = await courseScraper.getBookById(bookId);
            if (!response || !response.bookName) {
                return c.json({ msg: 'Failed to get book from external scraper service.' }, 404);
            }
            book = response;
            return c.json(book);
        }

        if (
            decodedUrl.includes("sharing-material/") ||
            decodedUrl.includes("SharingMaterial/")
        ) {
            const bookCode =
                decodedUrl.split("sharing-material/")[1] ??
                decodedUrl.split("SharingMaterial/")[1];
            const response = await courseScraper.getBookByCode(bookCode);
            if (!response || !response.bookName) {
                return c.json({ msg: 'Failed to get book from external scraper service.' }, 404);
            }
            book = response;
            return c.json(book);
        }

        return c.json({ message:"book not found" }, 404);
    } catch (err: any) {
        console.error(err.message);
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
    apiTokenAuth, // Use Hono-compatible API token middleware
    validator("json", (value, c) => {
      const parsed = copyCourseSchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
      }
      return parsed.data;
    }),
    async (c) => {
        const { bookId, userId } = c.req.valid("json");
        const apiUser = c.get('apiUser'); // Get apiUser from Hono context
        const token = apiUser.apiToken; // Use the stored API token

        
        try {
            // This call still relies on puppeteer and will not work in Cloudflare Workers.
            // The courseScraperService needs to be externalized.
            // if (!courseScraperService.currentBook.sharingMaterialId) {
            //     console.log(
            //         "\nsharingMaterialId not found. Checking if can share...",
            //     );

            const canBookBeSharedResponse = await courseScraper.copyCourse(
                bookId,
                userId,
                token
            );

           

            const canBookBeShared = canBookBeSharedResponse;
            console.log("book can be share:", canBookBeShared);
                
            if (canBookBeShared) {
                console.log("\ncan share. Setting sharingMaterialId...");
                const sharingMaterialId = await courseScraper.setSharingMaterialId(bookId, token);

                if ( !sharingMaterialId) {
                    return c.json({ msg: 'Failed to set sharing material ID from external scraper service.' }, 400);
                }
                // courseScraperService.currentBook.sharingMaterialId = sharingMaterialId;
                // console.log(
                //     "\nsharingMaterialId: " +
                //         sharingMaterialId, // Log the received ID directly
                // );
            } else {
                console.log("\ncannot share. won't try to copy");
                return c.json({ msg: "Book cannot be shared" }, 400);
            }

            const copyCourseResponse = await courseScraper.copyCourse(
                bookId,
                userId,
                token
            );

            if (!copyCourseResponse.success) {
                return c.json({ msg: 'Failed to copy course with external scraper service.' }, 400);
            }
            const result = copyCourseResponse;
            return c.json(result);
        } catch (err: any) {
            console.error(err.message);
            return c.json({ msg: "Server Error" }, 500);
        }
    },
);

// Removed the /token endpoint and its Swagger documentation as it's no longer needed.

export default scraperRoutes;
