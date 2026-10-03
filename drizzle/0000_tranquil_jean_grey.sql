CREATE TABLE `batch_events` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`event_type` text NOT NULL,
	`title` text NOT NULL,
	`location` text,
	`actor_id` text NOT NULL,
	`actor_role` text,
	`notes` text,
	`previous_hash` text,
	`event_hash` text,
	`verified` integer DEFAULT false NOT NULL,
	`evidence_image_data` text,
	`evidence_image_hash` text,
	`occurred_at` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `wool_batches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_batch_events_batch_occurred` ON `batch_events` (`batch_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `bids` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`buyer_id` text NOT NULL,
	`price_per_kg` real NOT NULL,
	`pickup_days` integer NOT NULL,
	`payment_terms` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `wool_batches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`provider_name` text NOT NULL,
	`scheduled_at` integer NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `wool_batches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `farms` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`village` text NOT NULL,
	`district` text NOT NULL,
	`state` text NOT NULL,
	`flock_size` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`picture` text,
	`role` text DEFAULT 'farmer' NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`upi_vpa` text,
	`upi_name` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `wool_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`farmer_id` text NOT NULL,
	`farm_id` text,
	`breed` text NOT NULL,
	`sheared_at` integer NOT NULL,
	`weight_kg` real NOT NULL,
	`grade` text DEFAULT 'Pending' NOT NULL,
	`micron` real,
	`staple_mm` real,
	`status` text DEFAULT 'registered' NOT NULL,
	`reserve_price` real DEFAULT 0 NOT NULL,
	`current_owner_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`farmer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON UPDATE no action ON DELETE no action
);
