/**
 * RBAC Examples
 * This file demonstrates how to use the RBAC system in route handlers
 */

import { Hono } from 'hono';
import { auth, AuthVariables } from '../middleware/auth';
import { authorize, hasRole, hasAnyRole, meetsRoleHierarchy } from '../middleware/rbac';
import { Env } from '..';

// Example 1: Basic Role-Based Route Protection
export const exampleBasicRBAC = () => {
  const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

  // Only admins can delete users
  app.delete('/api/users/:id', auth, authorize(['admin']), async (c) => {
    const userId = c.req.param('id');
    // Perform user deletion
    return c.json({ msg: 'User deleted' });
  });

  // Teachers and admins can create courses
  app.post('/api/courses', auth, authorize(['admin', 'teacher']), async (c) => {
    const courseData = await c.req.json();
    // Create course
    return c.json({ msg: 'Course created' }, 201);
  });

  // All authenticated users can view dashboard
  app.get('/api/dashboard', auth, async (c) => {
    const dashboardData = { courses: [], stats: {} };
    return c.json(dashboardData);
  });
};

// Example 2: Dynamic Permission Checking
export const exampleDynamicPermissions = () => {
  const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

  app.get('/api/courses/:courseId/edit-capability', auth, async (c) => {
    const user = c.get('user');
    const courseId = c.req.param('courseId');

    // Check if user can edit this course
    const canEdit = hasAnyRole(user, ['admin', 'teacher']);

    if (!canEdit) {
      return c.json({ canEdit: false, msg: 'Insufficient permissions' }, 403);
    }

    // Additional permission check - maybe only the course creator or admin can edit
    const db = (c.env as Env).drizzleDb;
    // const course = await db.select().from(courses).where(eq(courses.id, courseId));
    // if (course.userId !== user.id && user.role !== 'admin') {
    //   return c.json({ canEdit: false, msg: 'You do not own this course' }, 403);
    // }

    return c.json({ canEdit: true });
  });
};

// Example 3: Role Hierarchy Checks
export const exampleRoleHierarchy = () => {
  const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

  app.get('/api/analytics', auth, async (c) => {
    const user = c.get('user');

    // Require at least teacher level access
    if (!meetsRoleHierarchy(user.role as any, 'teacher')) {
      return c.json({ msg: 'Requires teacher or higher access' }, 403);
    }

    // Return analytics
    return c.json({
      totalCourses: 42,
      activeStudents: 156,
      averageProgress: 65.3,
    });
  });
};

// Example 4: Conditional Logic Based on Role
export const exampleConditionalLogic = () => {
  const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

  app.get('/api/reports', auth, async (c) => {
    const user = c.get('user');

    let reportData: any = {};

    // Different reports based on role
    if (hasRole(user, 'admin')) {
      reportData = {
        // Admin sees everything
        allUserStats: {},
        systemMetrics: {},
        courseStats: {},
        revenueData: {},
      };
    } else if (hasRole(user, 'teacher')) {
      reportData = {
        // Teachers see their course metrics
        myCoursesStats: {},
        studentProgress: {},
        engagementMetrics: {},
      };
    } else {
      // Students see their personal data
      reportData = {
        myProgress: {},
        enrolledCourses: {},
        recommendations: {},
      };
    }

    return c.json(reportData);
  });
};

// Example 5: Admin Actions with Validation
export const exampleAdminActions = () => {
  const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

  app.post('/api/admin/promote-user', auth, authorize(['admin']), async (c) => {
    const { userId, targetRole } = await c.req.json();
    const currentUser = c.get('user');
    const db = (c.env as Env).drizzleDb;

    // Security check: prevent self-demotion
    if (userId === currentUser.id && currentUser.role === 'admin' && targetRole !== 'admin') {
      return c.json({ msg: 'Cannot demote yourself from admin' }, 403);
    }

    // Import RBAC service and update role
    const RBACService = (await import('../services/rbacService')).default;
    const rbacService = new RBACService(db as any);

    try {
      const updatedUser = await rbacService.promoteUser(userId, targetRole);
      return c.json({ msg: 'User promoted', data: updatedUser });
    } catch (err: any) {
      return c.json({ msg: err.message }, 400);
    }
  });
};

// Example 6: Logging Sensitive Actions
export const exampleLoggingActions = () => {
  const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

  app.post('/api/admin/users/:userId/role', auth, authorize(['admin']), async (c) => {
    const userId = c.req.param('userId');
    const { newRole } = await c.req.json();
    const currentUser = c.get('user');
    const db = (c.env as Env).drizzleDb;

    // Import and use logging service
    // Note: LogHogClient requires (logHogService: Fetcher, token: string, waitUntil: Function)
    // const logService = new LogHogClient(c.env.LOG_API, c.env.LOGHOG_APP_TOKEN || '', c.waitUntil);
    
    // For now, just log to console (LogHog integration happens in middleware)
    console.log('Role change action:', {
      actionType: 'role_change',
      targetUserId: userId,
      newRole: newRole,
      adminId: currentUser.id,
      adminEmail: currentUser.email,
      timestamp: new Date().toISOString(),
    });

    return c.json({ msg: 'Role updated and logged' });
  });
};

// Example 7: Multi-Role Access with Specific Permissions
export const exampleMultiRoleAccess = () => {
  const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

  // Endpoint accessible by teachers and admins only
  app.post('/api/courses/:courseId/publish', auth, authorize(['teacher', 'admin']), async (c) => {
    const user = c.get('user');
    const courseId = c.req.param('courseId');
    const db = (c.env as Env).drizzleDb;

    // Teachers can only publish their own courses
    // Admins can publish any course
    if (hasRole(user, 'teacher')) {
      // Check course ownership
      // const course = await db.select().from(courses).where(eq(courses.id, courseId));
      // if (course.userId !== user.id) {
      //   return c.json({ msg: 'You can only publish your own courses' }, 403);
      // }
    }

    // Publish course
    return c.json({ msg: 'Course published' });
  });
};

// Example 8: Progressive Enhancement Based on Role
export const exampleProgressiveEnhancement = () => {
  const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

  app.get('/api/courses/:courseId', auth, async (c) => {
    const user = c.get('user');
    const courseId = c.req.param('courseId');

    // All roles can see course details
    const courseData = {
      id: courseId,
      title: 'Course Title',
      description: 'Course description',
      modules: [],
    };

    // Teachers and admins see additional data
    if (hasAnyRole(user, ['teacher', 'admin'])) {
      Object.assign(courseData, {
        enrollmentStats: { total: 100, active: 85 },
        completionRate: 65.5,
      });
    }

    // Only admins see sensitive data
    if (hasRole(user, 'admin')) {
      Object.assign(courseData, {
        revenue: 1500,
        internalNotes: 'Some admin notes',
      });
    }

    return c.json(courseData);
  });
};

export default {
  exampleBasicRBAC,
  exampleDynamicPermissions,
  exampleRoleHierarchy,
  exampleConditionalLogic,
  exampleAdminActions,
  exampleLoggingActions,
  exampleMultiRoleAccess,
  exampleProgressiveEnhancement,
};

