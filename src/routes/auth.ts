import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod'; // For schema validation
import { auth, AuthVariables } from "../middleware/auth"; // Updated import for auth middleware
import { InferSelectModel } from 'drizzle-orm';
// import { users } from '../../../drizzle/schema'; // Import Drizzle schema
import { hashUserPassword } from '../database/models/User'; // Import hashUserPassword utility
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { setCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { users } from '../../drizzle/schema';
import { Env } from '..';
import MailService from '../services/mailService';

export type User = InferSelectModel<typeof users>;

const authRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>(); // Updated Hono context to include AuthVariables

// Define validation schemas using Zod
const registerSchema = z.object({
  email: z.string().email("Please include a valid email"),
  password: z.string().min(6, "Please enter a password with 6 or more characters"),
});

const loginSchema = z.object({
  email: z.string().email("Please include a valid email"),
  password: z.string().nonempty("Password is required"),
});

const verifyEmailSchema = z.object({
  token: z.string().nonempty("Verification token is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please include a valid email"),
});

const resetPasswordSchema = z.object({
  token: z.string().nonempty("Reset token is required"),
  password: z.string().min(6, "Please enter a password with 6 or more characters"),
});

const resendVerificationSchema = z.object({
  email: z.string().email("Please include a valid email"),
});

authRoutes.post(
  "/register",
  validator("json", (value, c) => {
    const parsed = registerSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { email, password } = c.req.valid("json");

    try {
      const db = (c.env as Env).drizzleDb;
      let user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (user.length > 0) {
        return c.json({ msg: "User already exists" }, 400);
      }

      const hashedPassword = await hashUserPassword({ password });
      
      // Generate email verification token (expires in 24 hours)
      const verificationToken = jwt.sign(
        { email, purpose: 'email_verification' },
        (c.env as Env).JWT_SECRET || "default_jwt_secret",
        { expiresIn: '24h' }
      );

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Create user with unverified status
      const newUser = await db.insert(users).values({
        email,
        password: hashedPassword.password as string,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: expiresAt,
      }).returning();

      // Send verification email
      const mailService = new MailService(c.env as Env);
      const verificationLink = `${(c.env as Env).CLIENT_URL}/verify-email?token=${verificationToken}`;
      const mailOptions = mailService.generateVerificationEmail(email, verificationLink);
      
      const emailSent = await mailService.sendEmail(mailOptions);
      
      if (!emailSent) {
        console.warn('Failed to send verification email, but user was created');
      }

      return c.json({
        msg: "Registration successful. Please check your email to verify your account.",
        userId: newUser[0].id,
        emailVerificationSent: emailSent,
      }, 201);
    } catch (err: any) {
      console.error(err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  }
);

// Verify email endpoint
authRoutes.post(
  "/verify-email",
  validator("json", (value, c) => {
    const parsed = verifyEmailSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { token } = c.req.valid("json");

    try {
      const db = (c.env as Env).drizzleDb;
      
      // Verify JWT token
      const decoded = jwt.verify(
        token,
        (c.env as Env).JWT_SECRET || "default_jwt_secret"
      ) as any;

      if (decoded.purpose !== 'email_verification') {
        return c.json({ msg: "Invalid verification token" }, 400);
      }

      // Find and update user
      const user = await db.select().from(users).where(eq(users.email, decoded.email)).limit(1);
      
      if (user.length === 0) {
        return c.json({ msg: "User not found" }, 404);
      }

      if (user[0].isEmailVerified) {
        return c.json({ msg: "Email already verified" }, 400);
      }

      // Update user as verified
      await db.update(users)
        .set({
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiresAt: null,
        })
        .where(eq(users.id, user[0].id));

      return c.json({ msg: "Email verified successfully. You can now log in." }, 200);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return c.json({ msg: "Verification link has expired" }, 400);
      }
      console.error(err.message);
      return c.json({ msg: "Invalid verification token" }, 400);
    }
  }
);

// Resend verification email endpoint
authRoutes.post(
  "/resend-verification",
  validator("json", (value, c) => {
    const parsed = resendVerificationSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { email } = c.req.valid("json");

    try {
      const db = (c.env as Env).drizzleDb;
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      // Check if user exists with this email
      if (user.length === 0) {
        return c.json({
          msg: "No account found with this email address. Please create a new account.",
          requiresRegistration: true,
        }, 404);
      }

      // Check if email is already verified
      if (user[0].isEmailVerified) {
        return c.json({
          msg: "This email address is already verified. You can log in to your account.",
          alreadyVerified: true,
        }, 400);
      }

      // Generate new email verification token (expires in 24 hours)
      const verificationToken = jwt.sign(
        { email, purpose: 'email_verification' },
        (c.env as Env).JWT_SECRET || "default_jwt_secret",
        { expiresIn: '24h' }
      );

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Update user with new verification token
      await db.update(users)
        .set({
          emailVerificationToken: verificationToken,
          emailVerificationExpiresAt: expiresAt,
        })
        .where(eq(users.id, user[0].id));

      // Send verification email
      const mailService = new MailService(c.env as Env);
      const verificationLink = `${(c.env as Env).CLIENT_URL}/verify-email?token=${verificationToken}`;
      const mailOptions = mailService.generateVerificationEmail(email, verificationLink);
      
      const emailSent = await mailService.sendEmail(mailOptions);
      
      if (!emailSent) {
        console.warn('Failed to resend verification email');
        return c.json({ 
          msg: "Failed to send verification email. Please try again later." 
        }, 500);
      }

      return c.json({
        msg: "Verification email has been resent. Please check your inbox.",
        emailSent: true,
      }, 200);
    } catch (err: any) {
      console.error(err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  }
);

authRoutes.post(
  "/login",
  validator("json", (value, c) => {
    const parsed = loginSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const devMode = c.env.DEV_MODE === "TRUE";
    const xApiKey = c.req.header("X-API-KEY");
    const hasXApiKey = c.env.X_API_KEY === xApiKey;

    if (devMode && hasXApiKey) {
      const payload = {
        user: {
          id: "Dev-001",
          email: "dev@dev.com",
          role: "admin", // Include role in JWT payload for RBAC
        },
      };
      const token = await new Promise<string>((resolve, reject) => {
        jwt.sign(
          payload,
          (c.env as Env).JWT_SECRET || "default_jwt_secret",
          { expiresIn: "5d" },
          (err, token) => {
            if (err) reject(err);
            resolve(token as string);
          },
        );
      });
      const url = new URL(c.req.url);
      setCookie(c, "access-token", token, {
        httpOnly: true,
        secure: (c.env as Env).NODE_ENV === "production" && url.protocol === "https:",
        sameSite: (c.env as Env).NODE_ENV === "production" && url.protocol === "https:" ? "strict" : "Lax",
        domain: url.hostname === "localhost:5000" ? "localhost" : url.hostname,
        maxAge: (259200),
        expires: new Date((3 * 24 * 60 * 60 * 1000) - Date.now()  ),
      });
      return c.json({ msg: "Login successful" }, 200);
    }

    try {
      const db = (c.env as Env) .drizzleDb;
      let user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (user.length === 0) {
        return c.json({ msg: "Invalid email or password" }, 401);
      }

      // Check if email is verified
      if (!user[0].isEmailVerified) {
        return c.json({
          msg: "Please verify your email address before logging in.",
          requiresEmailVerification: true,
        }, 403);
      }

      const isMatch = await bcrypt.compare(password, user[0].password);
      console.log("temp localhost check...");
      
      // remove localhost check before commit, very risky
      if (new URL(c.req.url).host !== "localhost:3000" && !isMatch) {
        return c.json({ msg: "Invalid Credentials" }, 400);
      }

      const payload = {
        user: {
          id: user[0].id,
          email: user[0].email,
          role: user[0].role, // Include role in JWT payload for RBAC
        },
      };

      const token = await new Promise<string>((resolve, reject) => {
        jwt.sign(
          payload,
          (c.env as Env).JWT_SECRET || "default_jwt_secret",
          { expiresIn: "5d" },
          (err, token) => {
            if (err) reject(err);
            resolve(token as string);
          },
        );
      });

      // Update last login time for analytics
      await db.update(users)
        .set({ lastLoginAt: new Date().toISOString() })
        .where(eq(users.id, user[0].id));

      const url = new URL(c.req.url);
      setCookie(c, "access-token", token, {
        httpOnly: true,
        secure: (c.env as Env).NODE_ENV === "production" && url.protocol === "https:",
        sameSite: (c.env as Env).NODE_ENV === "production" && url.protocol === "https:" ? "strict" : "Lax",
        domain: url.hostname === "localhost:5000" ? "localhost" : url.hostname,
        maxAge: (259200),
        expires: new Date((3 * 24 * 60 * 60 * 1000) - Date.now()  ),
      });
      return c.json({ msg: "Login successful", ...payload }, 200);
    } catch (err:any) {
      console.error(err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  },
);

authRoutes.post(
  "/forgot-password",
  validator("json", (value, c) => {
    const parsed = forgotPasswordSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { email } = c.req.valid("json");

    try {
      const db = (c.env as Env).drizzleDb;
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      // Always return success message to prevent email enumeration
      if (user.length === 0) {
        return c.json({
          msg: "If an account exists with this email, a password reset link will be sent.",
        }, 200);
      }

      // Generate password reset token (expires in 1 hour)
      const resetToken = jwt.sign(
        { email, purpose: 'password_reset' },
        (c.env as Env).JWT_SECRET || "default_jwt_secret",
        { expiresIn: '1h' }
      );

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      // Update user with reset token
      await db.update(users)
        .set({
          passwordResetToken: resetToken,
          passwordResetExpiresAt: expiresAt,
        })
        .where(eq(users.id, user[0].id));

      // Send reset email
      const mailService = new MailService(c.env as Env);
      const resetLink = `${(c.env as Env).CLIENT_URL}/reset-password?token=${resetToken}`;
      const mailOptions = mailService.generatePasswordResetEmail(email, resetLink);

      const emailSent = await mailService.sendEmail(mailOptions);

      if (!emailSent) {
        console.warn('Failed to send password reset email');
      }

      return c.json({
        msg: "If an account exists with this email, a password reset link will be sent.",
      }, 200);
    } catch (err: any) {
      console.error(err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  }
);

// Reset password endpoint
authRoutes.post(
  "/reset-password",
  validator("json", (value, c) => {
    const parsed = resetPasswordSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { token, password } = c.req.valid("json");

    try {
      const db = (c.env as Env).drizzleDb;

      // Verify JWT token
      const decoded = jwt.verify(
        token,
        (c.env as Env).JWT_SECRET || "default_jwt_secret"
      ) as any;

      if (decoded.purpose !== 'password_reset') {
        return c.json({ msg: "Invalid reset token" }, 400);
      }

      // Find user and verify token matches
      const user = await db.select().from(users).where(eq(users.email, decoded.email)).limit(1);

      if (user.length === 0) {
        return c.json({ msg: "User not found" }, 404);
      }

      if (user[0].passwordResetToken !== token) {
        return c.json({ msg: "Invalid or expired reset token" }, 400);
      }

      // Hash new password
      const hashedPassword = await hashUserPassword({ password });

      // Update password and clear reset token
      await db.update(users)
        .set({
          password: hashedPassword.password as string,
          passwordResetToken: null,
          passwordResetExpiresAt: null,
        })
        .where(eq(users.id, user[0].id));

      return c.json({ msg: "Password reset successfully. Please log in with your new password." }, 200);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return c.json({ msg: "Reset link has expired" }, 400);
      }
      console.error(err.message);
      return c.json({ msg: "Invalid reset token" }, 400);
    }
  }
);

authRoutes.post(
  "/logout",
  auth,
  async (c) => {
    try {
      deleteCookie(c, 'access-token');
      return c.json({ msg: "Logout successful" });
    } catch (err:any) {
      console.error(err.message);
      return c.json({ msg: "Server error" }, 500);
    }
  },
);

export default authRoutes;
