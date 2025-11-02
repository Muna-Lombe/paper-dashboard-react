import jwt from "jsonwebtoken";
import { getCookie, setCookie } from 'hono/cookie';
export const auth = async (c, next) => {
    // Get token from cookie
    const token = getCookie(c, "access-token");
    // Check if no token
    if (!token) {
        return c.json({ msg: "No token, authorization denied" }, 401);
    }
    try {
        // Verify JWT
        const decoded = jwt.verify(token, c.env.JWT_SECRET || "default_jwt_secret");
        if (!decoded || !decoded.user) {
            throw new Error("Invalid token payload");
        }
        // Attach user from payload to request context
        c.set('user', decoded.user); // Cast to User type
        await next();
    }
    catch (err) {
        console.error("Auth middleware error:", err.message);
        // Clear invalid token cookie if it exists
        setCookie(c, "access-token", "", { expires: new Date(0) }); // Use setCookie to clear
        return c.json({ msg: "Token is not valid or expired" }, 401);
    }
};
