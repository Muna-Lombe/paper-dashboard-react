const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // Added bcrypt for password hashing

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Retrieve the authenticated user's profile information
 *     tags: [User]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-26T10:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-26T10:00:00Z"
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *       500:
 *         description: Server error
 */
router.get('/profile', async (req, res) => {
  try {
    // The 'auth' middleware should have already attached the user to req.user
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }, // Exclude password from the response
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update the authenticated user's profile details
 *     tags: [User]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email address for the user
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: User profile updated successfully
 *       400:
 *         description: Invalid input or email already in use
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/profile', async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body; // Example: allow updating email
  const userId = req.user.id;

  try {
    let user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if new email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
      user.email = email;
    }
    // Update other fields as needed, e.g., user.name = req.body.name;

    await user.save();

    res.json({ msg: 'User profile updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @swagger
 * /api/user/password:
 *   put:
 *     summary: Allow the authenticated user to change their password
 *     tags: [User]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: The user's current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The user's new password (min 6 characters)
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Invalid current password or new password too short
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/password', async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    let user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid current password' });
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @swagger
 * /api/user/profile:
 *   delete:
 *     summary: Allow the authenticated user to delete their account
 *     tags: [User]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: User account deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/profile', async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.destroy();
    res.clearCookie("access-token"); // Clear the access token cookie upon account deletion

    res.json({ msg: 'User account deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
