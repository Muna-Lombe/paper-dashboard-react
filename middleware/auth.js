const jwt = require("jsonwebtoken");
// const Token = require("../models/Token"); // No longer needed for this authentication flow
require("dotenv").config();

module.exports = async function (req, res, next) {
    // Get token from cookie
    const token = req.cookies["access-token"];

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");

        // Attach user from payload to request object
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        // Clear invalid token cookie if it exists
        res.clearCookie("access-token");
        res.status(401).json({ msg: "Token is not valid or expired" });
    }
};
