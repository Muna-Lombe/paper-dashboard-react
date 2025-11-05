import { Context, Next } from 'hono';
import { Env } from '../index';
import { AuthVariables } from './auth';
import { User } from '../routes/auth';

/**
 * RBAC Role Hierarchy
 * admin > teacher > student
 */
export type UserRole = 'admin' | 'teacher' | 'student';

/**
 * Role-based access control middleware
 * Restricts route access to specific roles
 *
 * @param allowedRoles - Array of roles allowed to access this route
 * @returns Hono middleware
 *
 * @example
 * // Allow only admins
 * app.delete('/api/users/:id', authorize(['admin']), handler);
 *
 * // Allow admins and teachers
 * app.post('/api/courses', authorize(['admin', 'teacher']), handler);
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return async (c: Context<{ Bindings: Env; Variables: AuthVariables }>, next: Next) => {
    try {
      // Get user from context (set by auth middleware)
      const user = c.get('user');

      if (!user) {
        return c.json({ msg: 'Unauthorized: User not found in context' }, 401);
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(user.role as UserRole)) {
        return c.json(
          {
            msg: 'Forbidden: Insufficient permissions',
            requiredRoles: allowedRoles,
            userRole: user.role,
          },
          403
        );
      }

      // User has the required role, proceed
      await next();
    } catch (err: any) {
      console.error('Authorization error:', err.message);
      return c.json({ msg: 'Authorization error' }, 500);
    }
  };
};

/**
 * Check if a user has a specific role
 * Useful for conditional logic within route handlers
 *
 * @param user - User object
 * @param requiredRole - Role to check against
 * @returns boolean indicating if user has the role
 */
export const hasRole = (user: User, requiredRole: UserRole): boolean => {
  return user.role === requiredRole;
};

/**
 * Check if user has one of multiple roles
 *
 * @param user - User object
 * @param requiredRoles - Array of roles to check
 * @returns boolean indicating if user has any of the roles
 */
export const hasAnyRole = (user: User, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(user.role as UserRole);
};

/**
 * Check role hierarchy - admin > teacher > student
 * Returns true if userRole is >= requiredRole in hierarchy
 *
 * @param userRole - Current user's role
 * @param requiredRole - Minimum required role
 * @returns boolean indicating if user meets the hierarchy requirement
 */
export const meetsRoleHierarchy = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const hierarchy: Record<UserRole, number> = {
    student: 0,
    teacher: 1,
    admin: 2,
  };
  return hierarchy[userRole] >= hierarchy[requiredRole];
};

/**
 * Get all roles that have permission for an action
 * Used to understand what roles can perform specific operations
 *
 * @param action - Action type
 * @returns Array of roles allowed for this action
 */
export const getRolesForAction = (
  action:
    | 'create_course'
    | 'delete_user'
    | 'edit_course'
    | 'view_analytics'
    | 'manage_roles'
    | 'view_dashboard'
): UserRole[] => {
  const actionRoles: Record<string, UserRole[]> = {
    view_dashboard: ['student', 'teacher', 'admin'],
    create_course: ['teacher', 'admin'],
    edit_course: ['teacher', 'admin'],
    view_analytics: ['teacher', 'admin'],
    delete_user: ['admin'],
    manage_roles: ['admin'],
  };

  return actionRoles[action] || [];
};

/**
 * Export default RBAC utilities for easier imports
 */
export default {
  authorize,
  hasRole,
  hasAnyRole,
  meetsRoleHierarchy,
  getRolesForAction,
};

