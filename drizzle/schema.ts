import { sqliteTable, text, uniqueIndex, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  progressMeSerialToken: text('progress_me_serial_token'),
}, () => []);

export const telegramRegistrationRequests = sqliteTable('telegram_registration_requests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  chatId: text('chat_id').notNull().unique(),
  email: text('email').notNull(),
  reasons: text('reasons'),
  useCase: text('use_case'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  apiToken: text('api_token'),
}, () => []);

export const schedules = sqliteTable('schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  lessonDays: text('lesson_days', { mode: 'json' }), // Assuming JSON stored as text
  holidayDays: text('holiday_days', { mode: 'json' }), // Assuming JSON stored as text
  holidayLessons: text('holiday_lessons', { mode: 'json' }), // Assuming JSON stored as text
  selectedMonths: text('selected_months', { mode: 'json' }), // Assuming JSON stored as text
  selectAll: integer('select_all', { mode: 'boolean' }),
  language: text('language'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (schedules) => [
  uniqueIndex('user_id_idx').on(schedules.userId),
]);

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  pdfUrl: text('pdf_url'),
  progress: integer('progress').notNull().default(0),
  userId: text('user_id').notNull().references(() => users.id),
  lastAccessed: text('last_accessed').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, () => []);

export const courseCorrections = sqliteTable('course_corrections', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').notNull().references(() => courses.id),
  blockId: integer('block_id'),
  correctionText: text('correction_text').notNull(),
}, () => []);

export const tokens = sqliteTable('tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  token: text('token').notNull().unique(),
  userId: text('user_id').references(() => users.id),
  userName: text('user_name'),
  userRoles: text('user_roles'),
  expiresAt: text('expires_at').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, () => []);

export const courseBlocks = sqliteTable('course_blocks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').notNull().references(() => courses.id),
  type: text('type', { enum: ['text', 'image', 'video', 'quiz'] }).notNull(),
  content: text('content'),
  order: integer('order').notNull(),
});



