CREATE TABLE `course_corrections` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`block_id` integer,
	`correction_text` text NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`pdf_url` text,
	`progress` integer DEFAULT 0 NOT NULL,
	`user_id` text NOT NULL,
	`last_accessed` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`lesson_days` text,
	`holiday_days` text,
	`holiday_lessons` text,
	`selected_months` text,
	`select_all` integer,
	`language` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_id_idx` ON `schedules` (`user_id`);--> statement-breakpoint
CREATE TABLE `telegram_registration_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`email` text NOT NULL,
	`reasons` text,
	`use_case` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`api_token` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `telegram_registration_requests_chat_id_unique` ON `telegram_registration_requests` (`chat_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `chat_id_idx` ON `telegram_registration_requests` (`chat_id`);--> statement-breakpoint
CREATE TABLE `tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`user_id` text,
	`user_name` text,
	`user_roles` text,
	`expires_at` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tokens_token_unique` ON `tokens` (`token`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`progress_me_serial_token` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `users` (`email`);