
// const jwt = require("jsonwebtoken");
// const Token = require("../models/Token");
require("dotenv").config();

// Function to validate UUID v4 format
function isValidUUIDv4(token) {
    const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidv4Regex.test(token);
}

module.exports = async function (req, res, next) {
    // Get token from header
    const token =
        req.header("x-auth-token") ||
        req.header("authorization")?.replace("Bearer ", "");

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        // Validate token format (UUID v4)
        if (!isValidUUIDv4(token)) {
            return res.status(401).json({ msg: "Invalid or expired token" });
        }
        next();
    } catch (err) {
        console.error("Scraper middleware error:", err.message);
        res.status(401).json({ msg: "Token validation failed" });
    }
};
