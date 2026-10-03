CREATE TABLE `batch_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`invited_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `wool_batches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participant_batch_email` ON `batch_participants` (`batch_id`,`email`);--> statement-breakpoint
CREATE TABLE `product_lots` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`parent_lot_id` text,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`weight_kg` real NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `wool_batches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `lots_batch` ON `product_lots` (`batch_id`);--> statement-breakpoint
CREATE TABLE `rate_windows` (
	`id` text PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`hits` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` ADD `onboarded` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `organisation` text;--> statement-breakpoint
ALTER TABLE `wool_batches` ADD `sale_status` text DEFAULT 'unlisted' NOT NULL;--> statement-breakpoint
ALTER TABLE `wool_batches` ADD `completed_at` integer;