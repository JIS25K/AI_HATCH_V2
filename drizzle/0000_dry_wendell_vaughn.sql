CREATE TABLE `admin_account` (
	`id` integer PRIMARY KEY NOT NULL,
	`password_hash` text NOT NULL,
	`salt` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_attempts` (
	`key` text NOT NULL,
	`bucket` integer NOT NULL,
	`attempts` integer NOT NULL,
	PRIMARY KEY(`key`, `bucket`)
);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `v2_events` (
	`run_id` text NOT NULL,
	`name` text NOT NULL,
	`detail` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`run_id`, `name`),
	FOREIGN KEY (`run_id`) REFERENCES `v2_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `v2_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`version` text NOT NULL,
	`source` text NOT NULL,
	`utm_source` text,
	`utm_campaign` text,
	`is_qa` integer DEFAULT 0 NOT NULL,
	`task` text,
	`blocker` text,
	`practice` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`started_at` text,
	`result_at` text,
	FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `v2_runs_cohort` ON `v2_runs` (`created_at`,`is_qa`);--> statement-breakpoint
CREATE INDEX `v2_runs_visitor` ON `v2_runs` (`visitor_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `visitors` (
	`id` text PRIMARY KEY NOT NULL,
	`first_seen` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
