import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { auth, AuthVariables } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { Env } from '..';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import RBACService from '../services/rbacService';
import { User } from './auth';

export type AdminUser = User;

const adminRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Validation schemas
const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newRole: z.enum(['student', 'teacher', 'admin'], {
    errorMap: () => ({ message: 'Invalid role. Must be one of: student, teacher, admin' }),
  }),
});

const getUsersSchema = z.object({
  role: z
    .enum(['student', 'teacher', 'admin'])
    .optional()
    .transform((val) => val || undefined),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine((val) => val >= 0, 'Offset must be non-negative'),
});

/**
 * GET /api/admin/users
 * Get list of users with optional role filter
 * Requires: admin role
 */
adminRoutes.get(
  '/users',
  auth,
  authorize(['admin']),
  validator('query', (value, c) => {
    const parsed = getUsersSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    try {
      const { role, limit, offset } = c.req.valid('query');
      const db = (c.env as Env).drizzleDb;

      let query = db.select().from(users);

      if (role) {
        query = query.where(eq(users.role, role)) as any;
      }

      const result = await query.limit(limit).offset(offset);

      return c.json({
        data: result,
        pagination: { limit, offset, total: result.length },
      });
    } catch (err: any) {
      console.error('Error fetching users:', err.message);
      return c.json({ msg: 'Failed to fetch users' }, 500);
    }
  }
);

/**
 * GET /api/admin/users/:userId
 * Get detailed user information
 * Requires: admin role
 */
adminRoutes.get(
  '/users/:userId',
  auth,
  authorize(['admin']),
  async (c) => {
    try {
      const userId = c.req.param('userId');
      const db = (c.env as Env).drizzleDb;

      const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (result.length === 0) {
        return c.json({ msg: 'User not found' }, 404);
      }

      return c.json({ data: result[0] });
    } catch (err: any) {
      console.error('Error fetching user:', err.message);
      return c.json({ msg: 'Failed to fetch user' }, 500);
    }
  }
);

/**
 * POST /api/admin/users/:userId/role
 * Update a user's role
 * Requires: admin role
 *
 * @body { newRole: 'student' | 'teacher' | 'admin' }
 */
adminRoutes.post(
  '/users/:userId/role',
  auth,
  authorize(['admin']),
  validator('json', (value, c) => {
    const schema = z.object({
      newRole: z.enum(['student', 'teacher', 'admin']),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    try {
      const userId = c.req.param('userId');
      const { newRole } = c.req.valid('json');
      const db = (c.env as Env).drizzleDb;
      const rbacService = new RBACService(db as any);

      // Check if user exists
      const userExists = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (userExists.length === 0) {
        return c.json({ msg: 'User not found' }, 404);
      }

      // Prevent self-demotion from admin
      const currentUser = c.get('user');
      if (userId === currentUser.id && currentUser.role === 'admin' && newRole !== 'admin') {
        return c.json({ msg: 'Cannot demote yourself from admin' }, 403);
      }

      const updatedUser = await rbacService.updateUserRole(userId, newRole);

      return c.json(
        {
          msg: 'User role updated successfully',
          data: updatedUser,
        },
        200
      );
    } catch (err: any) {
      console.error('Error updating user role:', err.message);
      return c.json({ msg: err.message || 'Failed to update user role' }, 500);
    }
  }
);

/**
 * POST /api/admin/users/:userId/promote
 * Promote a user to a higher role
 * Requires: admin role
 *
 * @body { targetRole: 'teacher' | 'admin' }
 */
adminRoutes.post(
  '/users/:userId/promote',
  auth,
  authorize(['admin']),
  validator('json', (value, c) => {
    const schema = z.object({
      targetRole: z.enum(['teacher', 'admin']),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    try {
      const userId = c.req.param('userId');
      const { targetRole } = c.req.valid('json');
      const db = (c.env as Env).drizzleDb;
      const rbacService = new RBACService(db as any);

      const updatedUser = await rbacService.promoteUser(userId, targetRole);

      if (!updatedUser) {
        return c.json({ msg: 'User not found' }, 404);
      }

      return c.json(
        {
          msg: 'User promoted successfully',
          data: updatedUser,
        },
        200
      );
    } catch (err: any) {
      console.error('Error promoting user:', err.message);
      return c.json({ msg: err.message || 'Failed to promote user' }, 500);
    }
  }
);

/**
 * POST /api/admin/users/:userId/demote
 * Demote a user to a lower role
 * Requires: admin role
 *
 * @body { targetRole: 'student' | 'teacher' }
 */
adminRoutes.post(
  '/users/:userId/demote',
  auth,
  authorize(['admin']),
  validator('json', (value, c) => {
    const schema = z.object({
      targetRole: z.enum(['student', 'teacher']),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    try {
      const userId = c.req.param('userId');
      const { targetRole } = c.req.valid('json');
      const db = (c.env as Env).drizzleDb;
      const rbacService = new RBACService(db as any);

      const updatedUser = await rbacService.demoteUser(userId, targetRole);

      if (!updatedUser) {
        return c.json({ msg: 'User not found' }, 404);
      }

      return c.json(
        {
          msg: 'User demoted successfully',
          data: updatedUser,
        },
        200
      );
    } catch (err: any) {
      console.error('Error demoting user:', err.message);
      return c.json({ msg: err.message || 'Failed to demote user' }, 500);
    }
  }
);

/**
 * GET /api/admin/stats/roles
 * Get statistics on user distribution by role
 * Requires: admin role
 */
adminRoutes.get('/stats/roles', auth, authorize(['admin']), async (c) => {
  try {
    const db = (c.env as Env).drizzleDb;
    const rbacService = new RBACService(db as any);

    const counts = await rbacService.getUserCountByRole();

    return c.json({
      data: counts,
      total: counts.admin + counts.teacher + counts.student,
    });
  } catch (err: any) {
    console.error('Error fetching role statistics:', err.message);
    return c.json({ msg: 'Failed to fetch statistics' }, 500);
  }
});

export default adminRoutes;

