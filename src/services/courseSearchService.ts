import { Env } from '../index';
import { eq, like, gte, lte, desc, asc, and, or, sql } from 'drizzle-orm';
import { courses } from '../../drizzle/schema';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export interface CourseSearchFilters {
  search?: string; // Search in title and description
  minProgress?: number; // Minimum progress (0-100)
  maxProgress?: number; // Maximum progress (0-100)
  sortBy?: 'title' | 'progress' | 'lastAccessed' | 'recent'; // Sort field
  sortOrder?: 'asc' | 'desc'; // Sort direction
  limit?: number; // Results limit
  offset?: number; // Pagination offset
}

export interface CourseSearchResult {
  id: string;
  title: string;
  description: string;
  pdfUrl: string | null;
  progress: number;
  lastAccessed: string;
  userId: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Course search and filtering service
 */
export class CourseSearchService {
  private db: DrizzleD1Database;

  constructor(db: DrizzleD1Database) {
    this.db = db;
  }

  /**
   * Search and filter courses for a user
   */
  async searchUserCourses(
    userId: string,
    filters: CourseSearchFilters = {}
  ): Promise<PaginatedResult<CourseSearchResult>> {
    try {
      const {
        search = '',
        minProgress = 0,
        maxProgress = 100,
        sortBy = 'lastAccessed',
        sortOrder = 'desc',
        limit = 10,
        offset = 0,
      } = filters;

      // Build where conditions
      const whereConditions = [eq(courses.userId, userId)];

      // Add progress filter
      if (minProgress > 0 || maxProgress < 100) {
        whereConditions.push(
          and(
            gte(courses.progress as any, minProgress),
            lte(courses.progress as any, maxProgress)
          ) as any
        );
      }

      // Add search filter (search in title and description)
      if (search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        whereConditions.push(
          or(
            like(courses.title, searchPattern),
            like(courses.description, searchPattern)
          ) as any
        );
      }

      // Build sort order
      let orderByClause: any;
      switch (sortBy) {
        case 'title':
          orderByClause = sortOrder === 'asc' 
            ? asc(courses.title)
            : desc(courses.title);
          break;
        case 'progress':
          orderByClause = sortOrder === 'asc'
            ? asc(courses.progress as any)
            : desc(courses.progress as any);
          break;
        case 'lastAccessed':
          orderByClause = sortOrder === 'asc'
            ? asc(courses.lastAccessed as any)
            : desc(courses.lastAccessed as any);
          break;
        case 'recent':
          orderByClause = desc(courses.lastAccessed as any);
          break;
        default:
          orderByClause = desc(courses.lastAccessed as any);
      }

      // Get total count
      const countResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(courses)
        .where(and(...whereConditions));

      const total = countResult[0]?.count || 0;

      // Get paginated results
      const results = await this.db
        .select()
        .from(courses)
        .where(and(...whereConditions))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      return {
        data: results,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };
    } catch (error: any) {
      console.error('Error searching courses:', error.message);
      throw error;
    }
  }

  /**
   * Get suggested courses based on user's activity
   * (Courses with similar progress levels or recently updated)
   */
  async getSuggestedCourses(
    userId: string,
    limit: number = 5
  ): Promise<CourseSearchResult[]> {
    try {
      // Get user's average progress
      const avgProgressResult = await this.db
        .select({
          avg: sql<number>`AVG(${courses.progress})`,
        })
        .from(courses)
        .where(eq(courses.userId, userId));

      const avgProgress = avgProgressResult[0]?.avg || 50;

      // Get courses within +/- 20% of user's average progress
      const minRange = Math.max(0, avgProgress - 20);
      const maxRange = Math.min(100, avgProgress + 20);

      const suggested = await this.db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.userId, userId),
            gte(courses.progress as any, minRange),
            lte(courses.progress as any, maxRange)
          ) as any
        )
        .orderBy(desc(courses.lastAccessed as any))
        .limit(limit);

      return suggested;
    } catch (error: any) {
      console.error('Error getting suggested courses:', error.message);
      throw error;
    }
  }

  /**
   * Get courses by progress status
   */
  async getCoursesByStatus(
    userId: string,
    status: 'not-started' | 'in-progress' | 'completed',
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResult<CourseSearchResult>> {
    try {
      let progressCondition: any;

      switch (status) {
        case 'not-started':
          progressCondition = eq(courses.progress as any, 0);
          break;
        case 'in-progress':
          progressCondition = and(
            gte(courses.progress as any, 1),
            lte(courses.progress as any, 99)
          );
          break;
        case 'completed':
          progressCondition = eq(courses.progress as any, 100);
          break;
      }

      const countResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(courses)
        .where(and(eq(courses.userId, userId), progressCondition) as any);

      const total = countResult[0]?.count || 0;

      const results = await this.db
        .select()
        .from(courses)
        .where(and(eq(courses.userId, userId), progressCondition) as any)
        .orderBy(desc(courses.lastAccessed as any))
        .limit(limit)
        .offset(offset);

      return {
        data: results,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };
    } catch (error: any) {
      console.error(`Error getting ${status} courses:`, error.message);
      throw error;
    }
  }

  /**
   * Auto-complete course titles
   */
  async autocomplete(
    userId: string,
    query: string,
    limit: number = 5
  ): Promise<string[]> {
    try {
      if (!query.trim()) {
        return [];
      }

      const searchPattern = `${query.trim()}%`;
      const results = await this.db
        .select({ title: courses.title })
        .from(courses)
        .where(
          and(
            eq(courses.userId, userId),
            like(courses.title, searchPattern)
          ) as any
        )
        .orderBy(asc(courses.title))
        .limit(limit);

      return results.map((r) => r.title);
    } catch (error: any) {
      console.error('Error autocompleting:', error.message);
      throw error;
    }
  }

  /**
   * Get course statistics
   */
  async getCourseStats(userId: string) {
    try {
      const stats = await this.db
        .select({
          totalCourses: sql<number>`COUNT(*)`,
          completedCourses: sql<number>`SUM(CASE WHEN progress = 100 THEN 1 ELSE 0 END)`,
          inProgressCourses: sql<number>`SUM(CASE WHEN progress > 0 AND progress < 100 THEN 1 ELSE 0 END)`,
          notStartedCourses: sql<number>`SUM(CASE WHEN progress = 0 THEN 1 ELSE 0 END)`,
          averageProgress: sql<number>`AVG(progress)`,
        })
        .from(courses)
        .where(eq(courses.userId, userId));

      return stats[0] || {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        notStartedCourses: 0,
        averageProgress: 0,
      };
    } catch (error: any) {
      console.error('Error getting course stats:', error.message);
      throw error;
    }
  }
}

export default CourseSearchService;

