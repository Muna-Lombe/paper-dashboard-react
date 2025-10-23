const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
// const scraperMiddleware = require("../middleware/scraper"); // Old middleware
const courseScraperService = require("../services/courseScraper");
const TelegramRegistrationRequest = require("../models/TelegramRegistrationRequest"); // Import TelegramRegistrationRequest model

// API Token Authentication Middleware
const apiTokenAuth = async (req, res, next) => {
    const apiToken = req.cookies["api-token"] || req.header("x-api-token");

    if (!apiToken) {
        return res.status(401).json({ msg: "No API token, authorization denied for scraper access." });
    }

    try {
        const registrationRequest = await TelegramRegistrationRequest.findOne({
            where: {
                apiToken: apiToken,
                status: 'approved',
            },
        });

        if (!registrationRequest) {
            return res.status(401).json({ msg: "Invalid or expired API token for scraper access." });
        }

        req.apiUser = { // Attach API user info to request
            chatId: registrationRequest.chatId,
            email: registrationRequest.email,
            apiToken: registrationRequest.apiToken,
        };
        next();
    } catch (err) {
        console.error("API Token Auth middleware error:", err.message);
        res.status(500).send("Server Error");
    }
};

/**
 * @swagger
 * tags:
 *   name: Scraper
 *   description: Course scraping and importing functionality
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ScrapedCourse:
 *       type: object
 *       properties:
 *         bookId:
 *           type: string
 *           description: The ID of the book in ProgressMe
 *         userId:
 *           type: string
 *           description: The user ID in ProgressMe
 *         token:
 *           type: string
 *           description: Authentication token for ProgressMe
 */

/**
 * @swagger
 * /api/scraper/validate-url:
 *   post:
 *     summary: Validate and clean a course URL
 *     tags: [Scraper]
 *     security:
 *       - apiTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: The URL to validate
 *     responses:
 *       200:
 *         description: URL validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       400:
 *         description: Invalid URL
 *       401:
 *         description: Unauthorized - Missing or invalid API token
 *       500:
 *         description: Server error
 */
router.post(
    "/validate-url",
    [apiTokenAuth, check("url", "URL is required").not().isEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const validUrl = courseScraperService.validateUrl(req.body.url);
            if (!validUrl) {
                return res.status(400).json({ msg: "Invalid course URL" });
            }
            res.json({ url: validUrl });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    },
);

/**
 * @swagger
 * /api/scraper/auth:
 *   post:
 *     summary: Authenticate with ProgressMe
 *     tags: [Scraper]
 *     security:
 *       - apiTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Unauthorized - Missing or invalid API token
 *       500:
 *         description: Authentication failed
 */
router.post(
    "/getUserInfo", // Renamed from "/auth" to be more descriptive
    [
        apiTokenAuth, // Use new API token middleware
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;
            const authResult =
                await courseScraperService.authenticateWithWebSocket(
                    email,
                    password,
                );
            res.json(authResult);
            // courseScraperService.cleanup();
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Authentication failed");
        }
    },
);

/**
 * @swagger
 * /api/scraper/getbook?code:
 *   get:
 *     summary: Get a book by code
 *     tags: [Scraper]
 *     security:
 *       - apiTokenAuth: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: The book code
 *     responses:
 *       200:
 *         description: Book found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 book:
 *                   $ref: '#/components/schemas/ScrapedCourse'
 *       400:
 *         description: Invalid book code
 *       401:
 *         description: Unauthorized - Missing or invalid API token
 *       500:
 *         description: Server error
 *       503:
 *         description: Book not found
 *       504:
 *         description: Book not found
 *     components:
 *       schemas:
 *         ScrapedCourse:
 *           type: object
 *           properties:
 *             bookId:
 *               type: string
 *               description: The ID of the book in ProgressMe
 *             bookName:
 *               type: string
 *               description: The name of the book
 *
 */

router.get("/getbook", [apiTokenAuth], async (req, res) => {
    try {
        const { url } = req.query;
        // const bookContentRegex =
            /https:\/\/progressme\.ru\/cabinet\/school\/materials\/book\/\d+\/content/;
        const bookIdRegex = /\/book\/(\d+)/;
        let book = {};
        // lets say that the url is encoded
        const decodedUrl = atob(url);
        //check if code is book code or book id
        // lets say that we get a url like this
        // "https://progressme.ru/cabinet/school/materials/book/363945/content

        // we should extract the book id from the url and then use that to get the book
        // we can use the getBookById function from the scraper service
        // we can also use the getBookByCode function from the scraper service
        // !IMPORTANT!
        // we cannot use the getBookById function for now because we need the sharingMaterialId which is only available in the getBookByCode function.
        // So if only bookId is given, ask for a sharing link
        if (decodedUrl.includes("book/")) {
            const bookId = decodedUrl.match(bookIdRegex)[1].split("/")[0];
            book = await courseScraperService.getBookById(bookId);
            return res.json(book);
        }
        // if we get a url like this
        // "https://progressme.ru/sharing-material/4a9e8f6f-ba3e-4e97-93a3-9c74ca56a660"
        // we should extract the book id from the url and then use that to get the book
        if (
            decodedUrl.includes("sharing-material/") ||
            decodedUrl.includes("SharingMaterial/")
        ) {
            // the regex should match the entire code like "4a9e8f6f-ba3e-4e97-93a3-9c74ca56a660"

            const bookCode =
                decodedUrl.split("sharing-material/")[1] ??
                decodedUrl.split("SharingMaterial/")[1];
            book = await courseScraperService.getBookByCode(bookCode);
            return res.json(book);
        }

        res.json({ ...book });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

/**
 * @swagger
 * /api/scraper/copy-course:
 *   post:
 *     summary: Copy a course using WebSocket
 *     tags: [Scraper]
 *     security:
 *       - apiTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - userId
 *               - token
 *             properties:
 *               bookId:
 *                 type: string
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course copied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required information
 *       401:
 *         description: Unauthorized - Missing or invalid API token
 *       500:
 *         description: Failed to copy course
 */
router.post(
    "/copy-course",
    [
        apiTokenAuth, // Use new API token middleware
        check("bookId", "Book ID is required").not().isEmpty(),
        check("userId", "User ID is required").not().isEmpty(),
        check("token", "Token is required").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            //  we are getting the sharingmaterialId from the existing getBookByCode. You just need to pass that to the copyCourse function
            const { bookId, userId, token } = req.body;
            console.log(
                "\nsaving book:\nid: " +
                    bookId +
                    "\nuserId: " +
                    userId +
                    "\ntoken " +
                    token,
            );
            if (!courseScraperService.currentBook.sharingMaterialId) {
                console.log(
                    "\nsharingMaterialId not found. Checking if can share...",
                );

                const canBookBeShared =
                    await courseScraperService.isCanSharingMaterial(
                        bookId,
                        userId,
                        token,
                    );

                if (canBookBeShared) {
                    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log("\ncan share. Setting sharingMaterialId...");
                    const sharingMaterialId =
                        await courseScraperService.setSharingMaterialId(
                            bookId,
                            token,
                        );
                    courseScraperService.currentBook.sharingMaterialId =
                        sharingMaterialId;
                    console.log(
                        "\nsharingMaterialId: " +
                            courseScraperService.currentBook.sharingMaterialId,
                    );
                } else {
                    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log("\ncannot share... won't try to copy");
                    return res
                        .status(400)
                        .json({ msg: "Book cannot be shared" });
                }
            }

            const result = await courseScraperService.copyCourse(
                bookId,
                userId,
                token,
            );
            return res.json(result);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Failed to copy course");
        }
    },
);

// Removed the /api/scraper/token endpoint as it's replaced by API token generation during Telegram registration approval.

module.exports = router;
