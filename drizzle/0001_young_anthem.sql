ALTER TABLE "users" ADD COLUMN "internal_user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_internal_user_id_unique" UNIQUE("internal_user_id");