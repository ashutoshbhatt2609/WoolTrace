CREATE TABLE `payment_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`bid_id` text NOT NULL,
	`reference` text NOT NULL,
	`amount` real NOT NULL,
	`confirmed_by` text NOT NULL,
	`confirmed_at` integer NOT NULL,
	FOREIGN KEY (`bid_id`) REFERENCES `bids`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`confirmed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `receipt_bid` ON `payment_receipts` (`bid_id`);--> statement-breakpoint
ALTER TABLE `batch_events` ADD `performed_at` integer;
--> statement-breakpoint
-- Restore the completion marker only for records already recorded as completed.
UPDATE `wool_batches`
SET `completed_at` = max(`sheared_at`, coalesce((
 SELECT max(coalesce(`performed_at`, `occurred_at`)) FROM `batch_events`
 WHERE `batch_events`.`batch_id` = `wool_batches`.`id`
 AND (`event_type` = 'shearing_complete' OR `title` = 'Complete shearing with photo')
), `sheared_at`))
WHERE `completed_at` IS NULL AND (
 `status` IN ('shearing_complete','sheared','sold','pickup_recorded','delivery_recorded','storage_intake','storage_released','scouring_completed','carding_completed','spinning_completed','weaving_completed','dyeing_completed','finished_product_recorded')
 OR EXISTS (SELECT 1 FROM `batch_events` WHERE `batch_events`.`batch_id` = `wool_batches`.`id` AND `event_type` = 'shearing_complete')
);
--> statement-breakpoint
-- Old versions transferred ownership on acceptance. Preserve that history without
-- representing it as a bank payment confirmation or opening the batch for sale.
UPDATE `bids` SET `status` = 'legacy_transferred'
WHERE `status` = 'accepted' AND EXISTS (
 SELECT 1 FROM `wool_batches` WHERE `wool_batches`.`id` = `bids`.`batch_id`
 AND `current_owner_id` = `bids`.`buyer_id` AND `sale_status` = 'unlisted'
);
--> statement-breakpoint
UPDATE `wool_batches` SET `sale_status` = 'legacy_transferred'
WHERE `sale_status` = 'unlisted' AND (`current_owner_id` <> `farmer_id`) AND (
 `status` = 'sold' OR EXISTS (SELECT 1 FROM `bids` WHERE `bids`.`batch_id` = `wool_batches`.`id` AND `bids`.`status` = 'legacy_transferred')
);
