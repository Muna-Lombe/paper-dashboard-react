import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod'; // For schema validation
import { auth } from "../middleware/auth"; // Updated import for auth middleware
// import { users } from '../../../drizzle/schema'; // Import Drizzle schema
import { hashUserPassword } from '../database/models/User'; // Import hashUserPassword utility
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { setCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { users } from '../../drizzle/schema';
const authRoutes = new Hono(); // Updated Hono context to include AuthVariables
// Define validation schemas using Zod
const registerSchema = z.object({
    email: z.string().email("Please include a valid email"),
    password: z.string().min(6, "Please enter a password with 6 or more characters"),
});
const loginSchema = z.object({
    email: z.string().email("Please include a valid email"),
    password: z.string().nonempty("Password is required"),
});
authRoutes.post("/register", validator("json", (value, c) => {
    const parsed = registerSchema.safeParse(value);
    if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
}), async (c) => {
    const { email, password } = c.req.valid("json");
    try {
        const db = c.env.drizzleDb;
        let user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (user.length > 0) {
            return c.json({ msg: "User already exists" }, 400);
        }
        const hashedPassword = await hashUserPassword({ password });
        const newUser = await db.insert(users).values({ email, password: hashedPassword.password }).returning();
        const payload = {
            user: {
                id: newUser[0].id,
                email: newUser[0].email,
            },
        };
        const token = await new Promise((resolve, reject) => {
            jwt.sign(payload, c.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "5d" }, (err, token) => {
                if (err)
                    reject(err);
                resolve(token);
            });
        });
        const url = new URL(c.req.url);
        setCookie(c, "access-token", token, {
            httpOnly: true,
            maxAge: (259200),
            secure: c.env.NODE_ENV === "production" && url.protocol === "https:",
            sameSite: c.env.NODE_ENV === "production" && url.protocol === "https:" ? "strict" : "Lax",
            domain: url.hostname === "localhost" ? "localhost" : url.hostname,
            expires: new Date((3 * 24 * 60 * 60 * 1000) + Date.now()),
        });
        return c.json({ msg: "User registered successfully" }, 201);
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server error" }, 500);
    }
});
authRoutes.post("/login", validator("json", (value, c) => {
    const parsed = loginSchema.safeParse(value);
    if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
}), async (c) => {
    const { email, password } = c.req.valid("json");
    try {
        const db = c.env.drizzleDb;
        let user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (user.length === 0) {
            return c.json({ msg: "Invalid Credentials" }, 400);
        }
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return c.json({ msg: "Invalid Credentials" }, 400);
        }
        const payload = {
            user: {
                id: user[0].id,
                email: user[0].email,
            },
        };
        const token = await new Promise((resolve, reject) => {
            jwt.sign(payload, c.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "5d" }, (err, token) => {
                if (err)
                    reject(err);
                resolve(token);
            });
        });
        const url = new URL(c.req.url);
        setCookie(c, "access-token", token, {
            httpOnly: true,
            secure: c.env.NODE_ENV === "production" && url.protocol === "https:",
            sameSite: c.env.NODE_ENV === "production" && url.protocol === "https:" ? "strict" : "Lax",
            domain: url.hostname === "localhost" ? "localhost" : url.hostname,
            maxAge: (259200),
            expires: new Date((3 * 24 * 60 * 60 * 1000) - Date.now()),
        });
        return c.json({ msg: "Login successful", ...payload }, 200);
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server error" }, 500);
    }
});
authRoutes.post("/logout", auth, async (c) => {
    try {
        deleteCookie(c, 'access-token');
        return c.json({ msg: "Logout successful" });
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server error" }, 500);
    }
});
export default authRoutes;
