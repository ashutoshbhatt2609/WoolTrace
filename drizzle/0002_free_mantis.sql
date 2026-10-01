CREATE TABLE `batch_certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`serial` text NOT NULL,
	`product_name` text NOT NULL,
	`product_ref` text NOT NULL,
	`issued_by` text NOT NULL,
	`issued_at` integer NOT NULL,
	`snapshot_hash` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `wool_batches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_batch_certificates_batch` ON `batch_certificates` (`batch_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_batch_certificates_serial` ON `batch_certificates` (`serial`);--> statement-breakpoint
ALTER TABLE `batch_events` ADD `actor_role` text;--> statement-breakpoint
ALTER TABLE `batch_events` ADD `previous_hash` text;--> statement-breakpoint
ALTER TABLE `batch_events` ADD `event_hash` text;--> statement-breakpoint
ALTER TABLE `batch_events` ADD `verified` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_batch_events_batch_occurred` ON `batch_events` (`batch_id`,`occurred_at`);