CREATE TYPE "public"."friend_request_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "friend_requests" (
	"request_id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"status" "friend_request_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"message" text
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"user_id_1" integer NOT NULL,
	"user_id_2" integer NOT NULL,
	"became_friends_at" timestamp DEFAULT now(),
	"is_blocked" boolean DEFAULT false,
	CONSTRAINT "friendships_user_id_1_user_id_2_pk" PRIMARY KEY("user_id_1","user_id_2")
);
--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_sender_id_users_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiver_id_users_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_1_users_user_id_fk" FOREIGN KEY ("user_id_1") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_2_users_user_id_fk" FOREIGN KEY ("user_id_2") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;