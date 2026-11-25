ALTER TABLE `products` ADD `slug` text NOT NULL DEFAULT '';
ALTER TABLE `products` ADD `compare_at_price` real;
ALTER TABLE `products` ADD `details` text NOT NULL DEFAULT '';
ALTER TABLE `products` ADD `item_count` text NOT NULL DEFAULT '';
ALTER TABLE `products` ADD `experience_options` text NOT NULL DEFAULT '';
CREATE INDEX `idx_products_slug` ON `products` (`slug`);
