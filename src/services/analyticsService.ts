import { Env } from '../index';
import { eq, gte, and, desc, sql } from 'drizzle-orm';
import { users, courses } from '../../drizzle/schema';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  activeUsers: number; // Users who logged in in the last 7 days
  newUsersThisWeek: number;
  averageCoursesPerUser: number;
  courseCompletionRate: number; // Percentage of courses with 100% progress
  recentUsers: Array<{
    email: string;
    lastLoginAt: string | null;
    createdAt: string | null;
  }>;
}

export interface UserEngagementMetrics {
  userId: string;
  email: string;
  lastLoginAt: string | null;
  totalCoursesEnrolled: number;
  completedCourses: number; // Courses with 100% progress
  averageProgress: number;
  createdAt: string | null;
}

export interface CourseAnalytics {
  courseId: string;
  title: string;
  enrollmentCount: number;
  avgProgress: number;
  completionCount: number;
  completionRate: number;
}

/**
 * Analytics service for generating dashboard statistics and engagement metrics
 */
export class AnalyticsService {
  private db: DrizzleD1Database;

  constructor(db: DrizzleD1Database) {
    this.db = db;
  }

  /**
   * Get dashboard summary statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Total users
      const totalUsersResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(users);
      const totalUsers = totalUsersResult[0]?.count || 0;

      // Total courses
      const totalCoursesResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(courses);
      const totalCourses = totalCoursesResult[0]?.count || 0;

      // Active users (logged in within last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const activeUsersResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.lastLoginAt as any, sevenDaysAgo));
      const activeUsers = activeUsersResult[0]?.count || 0;

      // New users this week
      const newUsersResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.createdAt as any, sevenDaysAgo));
      const newUsersThisWeek = newUsersResult[0]?.count || 0;

      // Average courses per user
      const avgCoursesResult = await this.db
        .select({
          avg: sql<number>`CAST(COUNT(${courses.id}) AS FLOAT) / CAST(COUNT(DISTINCT ${courses.userId}) AS FLOAT)`,
        })
        .from(courses);
      const averageCoursesPerUser = avgCoursesResult[0]?.avg || 0;

      // Course completion rate
      const completedCoursesResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(courses)
        .where(eq(courses.progress as any, 100));
      const completedCourses = completedCoursesResult[0]?.count || 0;
      const courseCompletionRate = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

      // Recent users (last 5)
      const recentUsersResult = await this.db
        .select({
          email: users.email,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt as any))
        .limit(5);

      return {
        totalUsers,
        totalCourses,
        activeUsers,
        newUsersThisWeek,
        averageCoursesPerUser: Math.round(averageCoursesPerUser * 100) / 100,
        courseCompletionRate: Math.round(courseCompletionRate * 100) / 100,
        recentUsers: recentUsersResult,
      };
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error.message);
      throw error;
    }
  }

  /**
   * Get user engagement metrics for a specific user
   */
  async getUserMetrics(userId: string): Promise<UserEngagementMetrics | null> {
    try {
      const user = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return null;
      }

      const userCourses = await this.db
        .select()
        .from(courses)
        .where(eq(courses.userId, userId));

      const totalCoursesEnrolled = userCourses.length;
      const completedCourses = userCourses.filter((c) => c.progress === 100).length;
      const totalProgress = userCourses.reduce((sum, c) => sum + (c.progress || 0), 0);
      const averageProgress = totalCoursesEnrolled > 0 ? totalProgress / totalCoursesEnrolled : 0;

      return {
        userId,
        email: user[0].email,
        lastLoginAt: user[0].lastLoginAt,
        totalCoursesEnrolled,
        completedCourses,
        averageProgress: Math.round(averageProgress * 100) / 100,
        createdAt: user[0].createdAt,
      };
    } catch (error: any) {
      console.error('Error fetching user metrics:', error.message);
      throw error;
    }
  }

  /**
   * Get all users' engagement metrics
   */
  async getAllUsersMetrics(limit: number = 100): Promise<UserEngagementMetrics[]> {
    try {
      const allUsers = await this.db.select().from(users).limit(limit);

      const metrics = await Promise.all(
        allUsers.map((user) => this.getUserMetrics(user.id))
      );

      return metrics.filter((m) => m !== null) as UserEngagementMetrics[];
    } catch (error: any) {
      console.error('Error fetching all users metrics:', error.message);
      throw error;
    }
  }

  /**
   * Get course analytics
   */
  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics | null> {
    try {
      const course = await this.db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);

      if (course.length === 0) {
        return null;
      }

      // Count users enrolled in this course
      const enrollmentResult = await this.db
        .select({
          count: sql<number>`count(DISTINCT ${courses.userId})`,
          avgProgress: sql<number>`AVG(${courses.progress})`,
          completedCount: sql<number>`count(CASE WHEN ${courses.progress} = 100 THEN 1 END)`,
        })
        .from(courses)
        .where(eq(courses.id, courseId));

      const enrollment = enrollmentResult[0] || { count: 0, avgProgress: 0, completedCount: 0 };
      const enrollmentCount = enrollment.count || 0;
      const completionCount = enrollment.completedCount || 0;
      const completionRate = enrollmentCount > 0 ? (completionCount / enrollmentCount) * 100 : 0;

      return {
        courseId,
        title: course[0].title,
        enrollmentCount,
        avgProgress: Math.round((enrollment.avgProgress || 0) * 100) / 100,
        completionCount,
        completionRate: Math.round(completionRate * 100) / 100,
      };
    } catch (error: any) {
      console.error('Error fetching course analytics:', error.message);
      throw error;
    }
  }

  /**
   * Get top courses by enrollment
   */
  async getTopCourses(limit: number = 10): Promise<CourseAnalytics[]> {
    try {
      const topCourses = await this.db
        .select({
          courseId: courses.id,
          title: courses.title,
          count: sql<number>`count(DISTINCT ${courses.userId})`,
        })
        .from(courses)
        .groupBy(courses.id, courses.title)
        .orderBy(desc(sql<number>`count(DISTINCT ${courses.userId})`))
        .limit(limit);

      const analytics = await Promise.all(
        topCourses.map((c) => this.getCourseAnalytics(c.courseId))
      );

      return analytics.filter((a) => a !== null) as CourseAnalytics[];
    } catch (error: any) {
      console.error('Error fetching top courses:', error.message);
      throw error;
    }
  }
}

export default AnalyticsService;

