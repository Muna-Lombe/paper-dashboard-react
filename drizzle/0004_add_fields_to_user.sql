ALTER TABLE `users` ADD `is_email_verified` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `email_verification_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `email_verification_expires_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `password_reset_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `password_reset_expires_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `last_login_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` text;