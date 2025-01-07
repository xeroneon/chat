import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

// Define an enum for media types to ensure consistency
export const MediaType = pgEnum("media_type", [
  "image",
  "video",
  "audio",
  "document",
]);

// Users table
export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  drizzleUserId: serial("user_id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// Groups table
export const groups = pgTable("groups", {
  groupId: serial("group_id").primaryKey(),
  groupName: varchar("group_name", { length: 100 }).notNull(),
  description: text("description"),
  createdBy: integer("created_by").references(() => users.userId),
  createdAt: timestamp("created_at").defaultNow(),
});

// Group members table
export const groupMembers = pgTable(
  "group_members",
  {
    groupId: integer("group_id").references(() => groups.groupId),
    userId: integer("user_id").references(() => users.userId),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.groupId, t.userId] })]
);

// Messages table
export const messages = pgTable("messages", {
  messageId: serial("message_id").primaryKey(),
  groupId: integer("group_id").references(() => groups.groupId),
  userId: integer("user_id").references(() => users.userId),
  content: text("content"),
  mediaType: MediaType("media_type"),
  mediaPath: varchar("media_path", { length: 255 }),
  thumbnailPath: varchar("thumbnail_path", { length: 255 }),
  sentAt: timestamp("sent_at").defaultNow(),
});

// Additional table for multimedia messages
export const messageMedia = pgTable("message_media", {
  messageMediaId: serial("message_media_id").primaryKey(),
  messageId: integer("message_id").references(() => messages.messageId),
  mediaType: MediaType("media_type").notNull(),
  mediaUrl: varchar("media_url", { length: 255 }).notNull(),
  fileSize: integer("file_size"),
  duration: integer("duration"), // for audio/video
  width: integer("width"), // for images
  height: integer("height"), // for images
  createdAt: timestamp("created_at").defaultNow(),
});

// Optional: If you decide to implement key management for a future encryption feature
export const userKeys = pgTable("user_keys", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.userId),
  publicKey: varchar("public_key", { length: 255 }).notNull(),
  privateKeyEncrypted: varchar("private_key_encrypted", { length: 255 }),
  keyVersion: integer("key_version").default(1),
});
