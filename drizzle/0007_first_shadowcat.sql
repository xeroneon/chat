ALTER TABLE "users" DROP CONSTRAINT "users_internal_user_id_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "internal_user_id";