import { InferSelectModel } from 'drizzle-orm';
import { telegramRegistrationRequests } from '../../../drizzle/schema'; // Adjust path as needed

export type TelegramRegistrationRequest = InferSelectModel<typeof telegramRegistrationRequests>;

// Placeholder for any TelegramRegistrationRequest-related Drizzle queries or utility functions
// For example, a function to create a new registration request:
/*
export async function createTelegramRegistrationRequest(db: any, data: Partial<TelegramRegistrationRequest>) {
  return await db.insert(telegramRegistrationRequests).values(data).returning();
}
*/
