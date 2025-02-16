const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const courseScraperService = require("../services/courseScraper");

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
 *       - bearerAuth: []
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
 *       500:
 *         description: Server error
 */
router.post(
    "/validate-url",
    [auth, check("url", "URL is required").not().isEmpty()],
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
 *       - bearerAuth: []
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
 *       500:
 *         description: Authentication failed
 */
router.post(
    "/auth",
    [
        auth,
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
 *       - bearerAuth: []
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

router.get("/getbook", [], async (req, res) => {
    try {
        const { url } = req.query;

        let book = {};
        // lets say that the url is encoded
        const decodedUrl = atob(url);
        //check if code is book code or book id
        // lets say that we get a url like this
        // "https://progressme.ru/cabinet/school/materials/book/363945/content

        // we should extract the book id from the url and then use that to get the book
        // we can use the getBookById function from the scraper service
        // we can also use the getBookByCode function from the scraper service
        if (decodedUrl.includes("book/")) {
            const bookIdRegex = /\/book\/(\d+)/;

            const bookId = code.match(bookIdRegex)[1].split("/")[0];
            book = await courseScraperService.getBookById(bookId);
        }
        // if we get a url like this
        // "https://progressme.ru/sharing-material/4a9e8f6f-ba3e-4e97-93a3-9c74ca56a660"
        // we should extract the book id from the url and then use that to get the book
        if (decodedUrl.includes("sharing-material/") || decodedUrl.includes('SharingMaterial/')) {
            // the regex should match the entire code like "4a9e8f6f-ba3e-4e97-93a3-9c74ca56a660"

            const bookCode = decodedUrl.split("sharing-material/")[1] ?? decodedUrl.split("SharingMaterial/")[1];
            book = await courseScraperService.getBookByCode(bookCode);
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
 *       - bearerAuth: []
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
 *       500:
 *         description: Failed to copy course
 */
router.post(
    "/copy-course",
    [
        auth,
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
            const { bookId, userId, token } = req.body;
            const result = await courseScraperService.copyCourse(
                bookId,
                userId,
                token,
            );
            res.json(result);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Failed to copy course");
        }
    },
);

/**
 * @swagger
 * /api/scraper/token:
 *   get:
 *     summary: Generate a new auth token
 *     tags: [Scraper]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get("/token", auth, async (req, res) => {
    try {
        const token = courseScraperService.generateAuthToken();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Credentials", "true");
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
