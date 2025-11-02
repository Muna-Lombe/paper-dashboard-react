"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseBlocks = exports.tokens = exports.courseCorrections = exports.courses = exports.schedules = exports.telegramRegistrationRequests = exports.users = void 0;
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
var drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    email: (0, sqlite_core_1.text)('email').unique().notNull(),
    password: (0, sqlite_core_1.text)('password').notNull(),
    progressMeSerialToken: (0, sqlite_core_1.text)('progress_me_serial_token'),
}, function () { return []; });
exports.telegramRegistrationRequests = (0, sqlite_core_1.sqliteTable)('telegram_registration_requests', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    chatId: (0, sqlite_core_1.text)('chat_id').notNull().unique(),
    email: (0, sqlite_core_1.text)('email').notNull(),
    reasons: (0, sqlite_core_1.text)('reasons'),
    useCase: (0, sqlite_core_1.text)('use_case'),
    status: (0, sqlite_core_1.text)('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
    apiToken: (0, sqlite_core_1.text)('api_token'),
}, function () { return []; });
exports.schedules = (0, sqlite_core_1.sqliteTable)('schedules', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }),
    lessonDays: (0, sqlite_core_1.text)('lesson_days', { mode: 'json' }), // Assuming JSON stored as text
    holidayDays: (0, sqlite_core_1.text)('holiday_days', { mode: 'json' }), // Assuming JSON stored as text
    holidayLessons: (0, sqlite_core_1.text)('holiday_lessons', { mode: 'json' }), // Assuming JSON stored as text
    selectedMonths: (0, sqlite_core_1.text)('selected_months', { mode: 'json' }), // Assuming JSON stored as text
    selectAll: (0, sqlite_core_1.integer)('select_all', { mode: 'boolean' }),
    language: (0, sqlite_core_1.text)('language'),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))).notNull(),
    updatedAt: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))).notNull(),
}, function (schedules) { return [
    (0, sqlite_core_1.uniqueIndex)('user_id_idx').on(schedules.userId),
]; });
exports.courses = (0, sqlite_core_1.sqliteTable)('courses', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    title: (0, sqlite_core_1.text)('title').notNull(),
    description: (0, sqlite_core_1.text)('description').notNull(),
    pdfUrl: (0, sqlite_core_1.text)('pdf_url'),
    progress: (0, sqlite_core_1.integer)('progress').notNull().default(0),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(function () { return exports.users.id; }),
    lastAccessed: (0, sqlite_core_1.text)('last_accessed').default((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))).notNull(),
}, function () { return []; });
exports.courseCorrections = (0, sqlite_core_1.sqliteTable)('course_corrections', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    courseId: (0, sqlite_core_1.text)('course_id').notNull().references(function () { return exports.courses.id; }),
    blockId: (0, sqlite_core_1.integer)('block_id'),
    correctionText: (0, sqlite_core_1.text)('correction_text').notNull(),
}, function () { return []; });
exports.tokens = (0, sqlite_core_1.sqliteTable)('tokens', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    token: (0, sqlite_core_1.text)('token').notNull().unique(),
    userId: (0, sqlite_core_1.text)('user_id').references(function () { return exports.users.id; }),
    userName: (0, sqlite_core_1.text)('user_name'),
    userRoles: (0, sqlite_core_1.text)('user_roles'),
    expiresAt: (0, sqlite_core_1.text)('expires_at').notNull(),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))).notNull(),
    updatedAt: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))).notNull(),
}, function () { return []; });
exports.courseBlocks = (0, sqlite_core_1.sqliteTable)('course_blocks', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    courseId: (0, sqlite_core_1.text)('course_id').notNull().references(function () { return exports.courses.id; }),
    type: (0, sqlite_core_1.text)('type', { enum: ['text', 'image', 'video', 'quiz'] }).notNull(),
    content: (0, sqlite_core_1.text)('content'),
    order: (0, sqlite_core_1.integer)('order').notNull(),
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
