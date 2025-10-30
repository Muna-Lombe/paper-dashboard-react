import { InferSelectModel } from 'drizzle-orm';
import { schedules } from '../../../drizzle/schema'; // Adjust path as needed

export type Schedule = InferSelectModel<typeof schedules>;

// Placeholder for any Schedule-related Drizzle queries or utility functions
/*
export async function createSchedule(db: any, data: Partial<Schedule>) {
  return await db.insert(schedules).values(data).returning();
}
*/
