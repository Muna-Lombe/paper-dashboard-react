import { InferSelectModel } from 'drizzle-orm';
import { courses } from '../../../drizzle/schema'; // Adjust path as needed

export type Course = InferSelectModel<typeof courses>;

// Placeholder for any Course-related Drizzle queries or utility functions
/*
export async function createCourse(db: any, data: Partial<Course>) {
  return await db.insert(courses).values(data).returning();
}
*/
