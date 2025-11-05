import { DrizzleD1Database } from 'drizzle-orm/d1';
import { users } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { UserRole } from '../middleware/rbac';
import { User } from '../routes/auth';

/**
 * RBAC Service
 * Handles role management, permission checking, and user role updates
 */
export class RBACService {
  constructor(private db: DrizzleD1Database<any>) {}

  /**
   * Update a user's role
   * Only admins can call this directly
   *
   * @param userId - User ID to update
   * @param newRole - New role to assign
   * @returns Updated user object
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<User | null> {
    try {
      if (!['student', 'teacher', 'admin'].includes(newRole)) {
        throw new Error(`Invalid role: ${newRole}`);
      }

      const result = await this.db
        .update(users)
        .set({ role: newRole })
        .where(eq(users.id, userId))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Get a user's current role
   *
   * @param userId - User ID
   * @returns User's role or null if user not found
   */
  async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const result = await this.db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return result[0]?.role as UserRole | null;
    } catch (error) {
      console.error('Error getting user role:', error);
      throw error;
    }
  }

  /**
   * Get count of users by role
   *
   * @returns Object with counts for each role
   */
  async getUserCountByRole(): Promise<{
    admin: number;
    teacher: number;
    student: number;
  }> {
    try {
      const result = await this.db
        .select({
          role: users.role,
          count: sql<number>`COUNT(*)`,
        })
        .from(users)
        .groupBy(users.role)
        .all() as any;

      const counts = { admin: 0, teacher: 0, student: 0 };

      for (const row of result) {
        if (row.role in counts) {
          counts[row.role as UserRole] = row.count;
        }
      }

      return counts;
    } catch (error) {
      console.error('Error getting user count by role:', error);
      throw error;
    }
  }

  /**
   * Get all users with a specific role
   *
   * @param role - Role to filter by
   * @param limit - Maximum number of results
   * @param offset - Pagination offset
   * @returns Array of users with the specified role
   */
  async getUsersByRole(
    role: UserRole,
    limit: number = 50,
    offset: number = 0
  ): Promise<User[]> {
    try {
      return await this.db
        .select()
        .from(users)
        .where(eq(users.role, role))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  /**
   * Promote a user to a higher role
   * Cannot demote from admin or promote beyond admin
   *
   * @param userId - User ID to promote
   * @param targetRole - Target role (must be higher than current)
   * @returns Updated user object or null
   */
  async promoteUser(userId: string, targetRole: UserRole): Promise<User | null> {
    try {
      const currentUser = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (currentUser.length === 0) {
        throw new Error('User not found');
      }

      const hierarchy: Record<UserRole, number> = {
        student: 0,
        teacher: 1,
        admin: 2,
      };

      const currentLevel = hierarchy[currentUser[0].role as UserRole];
      const targetLevel = hierarchy[targetRole];

      if (targetLevel <= currentLevel) {
        throw new Error(
          `Cannot promote to ${targetRole}. User is already at or above this level.`
        );
      }

      return await this.updateUserRole(userId, targetRole);
    } catch (error) {
      console.error('Error promoting user:', error);
      throw error;
    }
  }

  /**
   * Demote a user to a lower role
   * Cannot demote if user is the only admin
   *
   * @param userId - User ID to demote
   * @param targetRole - Target role (must be lower than current)
   * @returns Updated user object or null
   */
  async demoteUser(userId: string, targetRole: UserRole): Promise<User | null> {
    try {
      const currentUser = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (currentUser.length === 0) {
        throw new Error('User not found');
      }

      const hierarchy: Record<UserRole, number> = {
        student: 0,
        teacher: 1,
        admin: 2,
      };

      const currentLevel = hierarchy[currentUser[0].role as UserRole];
      const targetLevel = hierarchy[targetRole];

      // Prevent demotion if not actually lowering
      if (targetLevel >= currentLevel) {
        throw new Error(
          `Cannot demote to ${targetRole}. Target must be lower than current role.`
        );
      }

      // Prevent removing the last admin
      if (currentUser[0].role === 'admin') {
        const adminCount = (await this.getUserCountByRole()).admin;
        if (adminCount <= 1) {
          throw new Error('Cannot demote the last admin user');
        }
      }

      return await this.updateUserRole(userId, targetRole);
    } catch (error) {
      console.error('Error demoting user:', error);
      throw error;
    }
  }

  /**
   * Check if user can perform an action based on their role
   *
   * @param user - User object
   * @param action - Action to check
   * @returns boolean indicating if user can perform the action
   */
  canUserPerformAction(
    user: User,
    action:
      | 'create_course'
      | 'delete_user'
      | 'edit_course'
      | 'view_analytics'
      | 'manage_roles'
      | 'view_dashboard'
  ): boolean {
    const actionPermissions: Record<string, UserRole[]> = {
      view_dashboard: ['student', 'teacher', 'admin'],
      create_course: ['teacher', 'admin'],
      edit_course: ['teacher', 'admin'],
      view_analytics: ['teacher', 'admin'],
      delete_user: ['admin'],
      manage_roles: ['admin'],
    };

    const allowedRoles = actionPermissions[action] || [];
    return allowedRoles.includes(user.role as UserRole);
  }
}

export default RBACService;

