const express = require('express');
const router = express.Router();
// const auth = require('../middleware/auth'); // We'll use this later to protect routes
// const Schedule = require('../models/Schedule'); // We'll need a Schedule model

/**
 * @swagger
 * /api/schedule:
 *   post:
 *     summary: Save a user's schedule configuration
 *     tags: [Schedule]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduleData:
 *                 type: object
 *                 description: The schedule configuration data
 *                 example:
 *                   monday: ["Math", "Science"]
 *                   tuesday: ["History"]
 *     responses:
 *       200:
 *         description: Schedule configuration saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Schedule configuration saved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    const { scheduleData } = req.body;

    // Placeholder for saving schedule data
    console.log(`Saving schedule for user ${userId}:`, scheduleData);
    // You'll replace this with actual database operations using a Schedule model

    res.json({ msg: 'Schedule configuration saved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @swagger
 * /api/schedule:
 *   get:
 *     summary: Retrieve a user's saved schedule configuration
 *     tags: [Schedule]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved schedule configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scheduleData:
 *                   type: object
 *                   description: The user's saved schedule configuration data
 *                   example:
 *                     monday: ["Math", "Science"]
 *                     tuesday: ["History"]
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *       404:
 *         description: Schedule not found for user
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Placeholder for retrieving schedule data
    console.log(`Retrieving schedule for user ${userId}`);
    const savedSchedule = { // Mock data
      monday: ["Math", "Science"],
      tuesday: ["History"],
    };
    
    if (!savedSchedule) {
        return res.status(404).json({ msg: 'Schedule not found for user' });
    }

    res.json({ scheduleData: savedSchedule });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
