const jwt = require("jsonwebtoken");
const { getCookie, setCookie, deleteCookie } = require('hono/cookie'); // Import getCookie for Hono
// const Token = require("../models/Token"); // No longer needed for this authentication flow
require("dotenv").config();

module.exports = async function (c, next) { // Changed function signature for Hono
    // Get token from cookie
    const token = getCookie(c, "access-token"); // Use getCookie for Hono

    // Check if no token
    if (!token) {
        return c.json({ msg: "No token, authorization denied" }, 401); // Use c.json for Hono responses
    }

    try {
        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");

        // Attach user from payload to request context
        c.set('user', decoded.user); // Attach user to Hono context
        await next(); // Call next middleware in Hono
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        // Clear invalid token cookie if it exists
        c.cookie("access-token", "", { expires: new Date(0) }); // Clear cookie for Hono
        return c.json({ msg: "Token is not valid or expired" }, 401); // Use c.json for Hono responses
    }
};
