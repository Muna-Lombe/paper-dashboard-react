CREATE TABLE `course_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`type` text NOT NULL,
	`content` text,
	`order` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_course_corrections` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`block_id` integer NOT NULL,
	`correction_text` text NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`block_id`) REFERENCES `course_blocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_course_corrections`("id", "course_id", "block_id", "correction_text") SELECT "id", "course_id", "block_id", "correction_text" FROM `course_corrections`;--> statement-breakpoint
DROP TABLE `course_corrections`;--> statement-breakpoint
ALTER TABLE `__new_course_corrections` RENAME TO `course_corrections`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `tokens` ADD `tg_request_id` text REFERENCES telegram_registration_requests(id);--> statement-breakpoint
ALTER TABLE `tokens` DROP COLUMN `user_name`;--> statement-breakpoint
ALTER TABLE `tokens` DROP COLUMN `user_roles`;