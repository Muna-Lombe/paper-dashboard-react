const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const courseScraperService = require('../services/courseScraper');

// @route   POST api/scraper/validate-url
// @desc    Validate and clean a course URL
// @access  Private
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

// @route   POST api/scraper/auth
// @desc    Authenticate with ProgressMe
// @access  Private
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
        const authResult = await courseScraperService.authenticateWithProgressMe(email, password);
        res.json(authResult);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Authentication failed');
    }
});

// @route   POST api/scraper/copy-course
// @desc    Copy a course using WebSocket
// @access  Private
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

// @route   GET api/scraper/token
// @desc    Generate a new auth token
// @access  Private
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