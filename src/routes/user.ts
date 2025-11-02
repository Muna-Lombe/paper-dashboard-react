import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { setCookie, deleteCookie } from 'hono/cookie';
import { auth, AuthVariables } from '../middleware/auth';
import { InferSelectModel } from 'drizzle-orm';
import { users } from '../../drizzle/schema'; // Import Drizzle schema
import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { Env } from '..';

export type User = InferSelectModel<typeof users>;

const userRoutes = new Hono<{ Bindings: Env; Variables: { user: User; } & AuthVariables }>();

// Swagger documentation comments are not directly supported with Hono in this setup.
// They should be moved to a separate documentation generation process or removed.
// /**
// * @swagger
// * /api/user/profile:
// *   get:
// *     summary: Retrieve the authenticated user's profile information
// *     tags: [User]
// *     security:
// *       - CookieAuth: []
// *     responses:
// *       200:
// *         description: Successfully retrieved user profile
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 id:
// *                   type: integer
// *                   example: 1
// *                 email:
// *                   type: string
// *                   format: email
// *                   example: "user@example.com"
// *                 createdAt:
// *                   type: string
// *                   format: date-time
// *                   example: "2025-10-26T10:00:00Z"
// *                 updatedAt:
// *                   type: string
// *                   format: date-time
// *                   example: "2025-10-26T10:00:00Z"
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       500:
// *         description: Server error
// */
userRoutes.get('/profile', auth, async (c) => {
  try {
    const user = c.get('user');
    const db = (c.env as Env).drizzleDb;
    const foundUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

    if (foundUser.length === 0) {
      deleteCookie(c, 'access-token');
      return c.json({ msg: 'User not found' }, 404);
    }

    // Exclude password from the response
    const { password, ...userWithoutPassword } = foundUser[0];

    return c.json(userWithoutPassword);
  } catch (err:any) {
    console.error(err.message);
    return c.json({ msg: "Server Error" }, 500);
  }
});

const updateUserProfileSchema = z.object({
  email: z.string().email("Please include a valid email").optional(),
});

// /**
// * @swagger
// * /api/user/profile:
// *   put:
// *     summary: Update the authenticated user's profile details
// *     tags: [User]
// *     security:
// *       - CookieAuth: []
// *     requestBody:
// *       required: true
// *       content:
// *         application/json:
// *           schema:
// *             type: object
// *             properties:
// *               email:
// *                 type: string
// *                 format: email
// *                 description: New email address for the user
// *     responses:
// *       200:
// *         description: User profile updated successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 msg:
// *                   type: string
// *                   example: User profile updated successfully
// *       400:
// *         description: Invalid input or email already in use
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       404:
// *         description: User not found
// *       500:
// *         description: Server error
// */
userRoutes.put('/profile', 
  auth,
  validator("json", (value, c) => {
    const parsed = updateUserProfileSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { email } = c.req.valid("json");
    const user = c.get('user');
    const userId = user.id;

    try {
      const db = (c.env as Env).drizzleDb;
      let foundUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (foundUser.length === 0) {
        return c.json({ msg: 'User not found' }, 404);
      }

      // Check if new email is already taken by another user
      if (email && email !== foundUser[0].email) {
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
          return c.json({ msg: 'Email already in use' }, 400);
        }
        // Update email
        await db.update(users).set({ email }).where(eq(users.id, userId));
      }
      // Update other fields as needed, e.g., user.name = req.body.name;

      // Fetch the updated user to return
      const updatedUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      return c.json({ msg: 'User profile updated successfully', user: updatedUser[0] });
    } catch (err:any) {
      console.error(err.message);
      return c.json({ msg: "Server Error" }, 500);
    }
  },
);

const changePasswordSchema = z.object({
  currentPassword: z.string().nonempty("Current password is required"),
  newPassword: z.string().min(6, "New password must be 6 or more characters"),
});

// /**
// * @swagger
// * /api/user/password:
// *   put:
// *     summary: Allow the authenticated user to change their password
// *     tags: [User]
// *     security:
// *       - CookieAuth: []
// *     requestBody:
// *       required: true
// *       content:
// *         application/json:
// *           schema:
// *             type: object
// *             required:
// *               - currentPassword
// *               - newPassword
// *             properties:
// *               currentPassword:
// *                 type: string
// *                 format: password
// *                 description: The user's current password
// *               newPassword:
// *                 type: string
// *                 format: password
// *                 description: The user's new password (min 6 characters)
// *     responses:
// *       200:
// *         description: Password updated successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 msg:
// *                   type: string
// *                   example: Password updated successfully
// *       400:
// *         description: Invalid current password or new password too short
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       404:
// *         description: User not found
// *       500:
// *         description: Server error
// */
userRoutes.put('/password',
  auth,
  validator("json", (value, c) => {
    const parsed = changePasswordSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { currentPassword, newPassword } = c.req.valid("json");
    const user = c.get('user');
    const userId = user.id;

    try {
      const db = (c.env as Env).drizzleDb;
      let foundUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (foundUser.length === 0) {
        return c.json({ msg: 'User not found' }, 404);
      }

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, foundUser[0].password);
      if (!isMatch) {
        return c.json({ msg: 'Invalid current password' }, 400);
      }

      // Hash new password and save
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));

      return c.json({ msg: 'Password updated successfully' });
    } catch (err:any) {
      console.error(err.message);
      return c.json({ msg: "Server Error" }, 500);
    }
  },
);

// /**
// * @swagger
// * /api/user/profile:
// *   delete:
// *     summary: Allow the authenticated user to delete their account
// *     tags: [User]
// *     security:
// *       - CookieAuth: []
// *     responses:
// *       200:
// *         description: User account deleted successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 msg:
// *                   type: string
// *                   example: User account deleted successfully
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       404:
// *         description: User not found
// *       500:
// *         description: Server error
// */
userRoutes.delete('/profile', auth, async (c) => {
  const user = c.get('user');
  const userId = user.id;

  try {
    const db = (c.env as Env).drizzleDb;
    const foundUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (foundUser.length === 0) {
      return c.json({ msg: 'User not found' }, 404);
    }

    await db.delete(users).where(eq(users.id, userId));
    deleteCookie(c, "access-token");

    return c.json({ msg: 'User account deleted successfully' });
  } catch (err:any) {
    console.error(err.message);
    return c.json({ msg: "Server Error" }, 500);
  }
});

export default userRoutes;
