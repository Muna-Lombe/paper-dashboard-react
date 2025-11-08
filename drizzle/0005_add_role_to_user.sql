PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`progress_me_serial_token` text,
	`is_email_verified` integer DEFAULT false,
	`email_verification_token` text,
	`email_verification_expires_at` text,
	`password_reset_token` text,
	`password_reset_expires_at` text,
	`last_login_at` text,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password", "role", "progress_me_serial_token", "is_email_verified", "email_verification_token", "email_verification_expires_at", "password_reset_token", "password_reset_expires_at", "last_login_at", "created_at", "updated_at") SELECT "id", "email", "password", "role", "progress_me_serial_token", "is_email_verified", "email_verification_token", "email_verification_expires_at", "password_reset_token", "password_reset_expires_at", "last_login_at", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);