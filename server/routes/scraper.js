const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const courseScraperService = require('../services/courseScraper');

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
router.post('/validate-url', [
    auth,
    check('url', 'URL is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const validUrl = courseScraperService.validateUrl(req.body.url);
        if (!validUrl) {
            return res.status(400).json({ msg: 'Invalid course URL' });
        }
        res.json({ url: validUrl });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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
router.post('/auth', [
    auth,
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const authResult = await courseScraperService.authenticateWithWebSocket(email, password);
        res.json(authResult);
        courseScraperService.cleanup();
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Authentication failed');
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
router.post('/copy-course', [
    auth,
    check('bookId', 'Book ID is required').not().isEmpty(),
    check('userId', 'User ID is required').not().isEmpty(),
    check('token', 'Token is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { bookId, userId, token } = req.body;
        const result = await courseScraperService.copyCourse(bookId, userId, token);
        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Failed to copy course');
    }
});

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
router.get('/token', auth, async (req, res) => {
    try {
        const token = courseScraperService.generateAuthToken();
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 