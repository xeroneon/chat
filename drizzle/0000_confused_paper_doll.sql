CREATE TABLE "group_members" (
	"group_id" integer,
	"user_id" integer,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"group_id" serial PRIMARY KEY NOT NULL,
	"group_name" varchar(100) NOT NULL,
	"description" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_media" (
	"message_media_id" serial PRIMARY KEY NOT NULL,
	"message_id" integer,
	"media_type" "media_type" NOT NULL,
	"media_url" varchar(255) NOT NULL,
	"file_size" integer,
	"duration" integer,
	"width" integer,
	"height" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"group_id" integer,
	"user_id" integer,
	"content" text,
	"media_type" "media_type",
	"media_path" varchar(255),
	"thumbnail_path" varchar(255),
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_keys" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"public_key" varchar(255) NOT NULL,
	"private_key_encrypted" varchar(255),
	"key_version" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"last_login" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("group_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_media" ADD CONSTRAINT "message_media_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_group_id_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("group_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_keys" ADD CONSTRAINT "user_keys_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;