CREATE TABLE `batch_events` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`event_type` text NOT NULL,
	`title` text NOT NULL,
	`location` text,
	`actor_id` text NOT NULL,
	`notes` text,
	`occurred_at` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `wool_batches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
	`verified` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `service_listings` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`district` text NOT NULL,
	`price_label` text NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`picture` text,
	`role` text DEFAULT 'farmer' NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
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
