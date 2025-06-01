
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Token = require("../models/Token");

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthToken:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the token
 *         token:
 *           type: string
 *           description: The JWT token
 *         userId:
 *           type: string
 *           description: The user's Replit ID
 *         userName:
 *           type: string
 *           description: The user's Replit username
 *         userRoles:
 *           type: string
 *           description: The user's Replit roles
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: When the token expires
 *         isActive:
 *           type: boolean
 *           description: Whether the token is active
 */

/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Authenticate user and generate token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Replit user ID from headers
 *               userName:
 *                 type: string
 *                 description: Replit username from headers
 *               userRoles:
 *                 type: string
 *                 description: Replit user roles from headers
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
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     roles:
 *                       type: string
 *       400:
 *         description: Missing user information
 *       500:
 *         description: Server error
 */
router.post("/auth", async (req, res) => {
    try {
        // Get user info from Replit headers or request body
        const userId = req.headers['x-replit-user-id'] || req.body.userId;
        const userName = req.headers['x-replit-user-name'] || req.body.userName;
        const userRoles = req.headers['x-replit-user-roles'] || req.body.userRoles;

        if (!userId) {
            return res.status(400).json({ msg: "User ID is required" });
        }

        // Check if user already has an active token
        let existingToken = await Token.findOne({
            where: {
                userId: userId,
                isActive: true,
                expiresAt: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (existingToken) {
            return res.json({
                token: existingToken.token,
                user: {
                    id: existingToken.userId,
                    name: existingToken.userName,
                    roles: existingToken.userRoles
                }
            });
        }

        // Create new token
        const payload = {
            user: {
                id: userId,
                name: userName,
                roles: userRoles
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: "24h" }
        );

        // Store token in database
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const tokenRecord = await Token.create({
            token: token,
            userId: userId,
            userName: userName,
            userRoles: userRoles,
            expiresAt: expiresAt,
            isActive: true
        });

        res.json({
            token: token,
            user: {
                id: userId,
                name: userName,
                roles: userRoles
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify token and get user data
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     roles:
 *                       type: string
 *       401:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get("/verify", async (req, res) => {
    try {
        const token = req.header('x-auth-token') || req.header('authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ valid: false, msg: 'No token provided' });
        }

        // Check token in database
        const tokenRecord = await Token.findOne({
            where: {
                token: token,
                isActive: true,
                expiresAt: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (!tokenRecord) {
            return res.status(401).json({ valid: false, msg: 'Invalid or expired token' });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

        res.json({
            valid: true,
            user: {
                id: tokenRecord.userId,
                name: tokenRecord.userName,
                roles: tokenRecord.userRoles
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(401).json({ valid: false, msg: 'Token is not valid' });
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user by deactivating token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: No token provided
 *       500:
 *         description: Server error
 */
router.post("/logout", async (req, res) => {
    try {
        const token = req.header('x-auth-token') || req.header('authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ msg: 'No token provided' });
        }

        // Deactivate token in database
        await Token.update(
            { isActive: false },
            {
                where: {
                    token: token,
                    isActive: true
                }
            }
        );

        res.json({ msg: 'Logout successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
