import jwt, { JwtPayload } from "jsonwebtoken";
import { getCookie, setCookie } from 'hono/cookie';
import { Context, Next } from 'hono';
import { Env } from '../index'; // Assuming Env is defined in src/index.ts
import { User } from '../database/models/User'; // Assuming a User type/interface exists

export interface AuthVariables {
  user: User; // Define the user type that will be attached to the context
}

export const auth = async (c: Context<{ Bindings: Env; Variables: AuthVariables }>, next: Next) => {
  // Get token from cookie
  const token = getCookie(c, "access-token");

  // check if dev mode is true
  const xApiKey = c.req.header("X-API-KEY");
  const hasXApiKey = c.env.X_API_KEY === xApiKey;
  if (c.env.DEV_MODE === "TRUE" && hasXApiKey) {
    await next();
    return;
  }

  // Check if no token
  if (!token) {
    return c.json({ msg: "No token, authorization denied" }, 401);
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, c.env.JWT_SECRET || "default_jwt_secret") as JwtPayload;

    if (!decoded || !decoded.user) {
        throw new Error("Invalid token payload");
    }

    // Attach user from payload to request context
    c.set('user', decoded.user as User); // Cast to User type
    await next();
  } catch (err: any) {
    console.error("Auth middleware error:", err.message);
    // Clear invalid token cookie if it exists
    setCookie(c, "access-token", "", { expires: new Date(0) }); // Use setCookie to clear
    return c.json({ msg: "Token is not valid or expired" }, 401);
  }
};
