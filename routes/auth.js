const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Import bcryptjs
const { check, validationResult } = require("express-validator");
// const auth = require("../middleware/auth"); // Will be updated later
const User = require("../models/User"); // Import User model
// const Token = require("../models/Token"); // Comment out or remove Token model

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
 * /api/auth/register:
 *   post:
 *     summary: Register a new user with email and password
 *     tags: [Auth]
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
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 6 characters)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: access-token=your_jwt_token; HttpOnly; Path=/; Max-Age=3600
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Server error
 */
router.post(
  "/register",
  [
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters",
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ where: { email } });

      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      user = await User.create({
        email,
        password, // Password will be hashed in the User.beforeCreate hook
      });

      const payload = {
        user: {
          id: user.id,
          email: user.email,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || "default_jwt_secret", // Use a strong secret from environment variables
        { expiresIn: "5d" },
        (err, token) => {
          if (err) throw err;
          res.cookie("access-token", token, {
            httpOnly: true,
            maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            sameSite: "strict",
          });
          res.status(201).json({ msg: "User registered successfully" });
        },
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get access token
 *     tags: [Auth]
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
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: access-token=your_jwt_token; HttpOnly; Path=/; Max-Age=3600
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Login successful
 *       400:
 *         description: Invalid Credentials
 *       500:
 *         description: Server error
 */
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const url = new URL(req.headers.referer)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      const payload = {
        user: {
          id: user.id,
          email: user.email,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || "default_jwt_secret",
        { expiresIn: "5d" },
        (err, token) => {
          if (err) throw err;
          res.cookie("access-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" && url.protocol === "https:",
            sameSite: process.env.NODE_ENV === "production" && url.protocol === "https:" ? "strict" : "lax",
            domain: url.hostname === "localhost" ? "localhost" : url.hostname,
            maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days,
            expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            
          });
          res.json({ msg: "Login successful", ...payload });
        },
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
);

router.post(
  "/logout",
  async (req, res) => {
    const errors = validationResult(req);
    const url = new URL(req.headers.referer)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      res.clearCookie('access-token');
      res.json({ msg: "Logout successful" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
);

module.exports = router;
