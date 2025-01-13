import { InferInsertModel } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  pgEnum,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";

export const MediaType = pgEnum("media_type", [
  "image",
  "video",
  "audio",
  "document",
]);

export const FriendRequestStatus = pgEnum("friend_request_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  passwordHash: text("password_hash"),
  imageUrl: varchar("image_url", { length: 2048 }),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});
export type User = InferInsertModel<typeof users>;

export const friendRequests = pgTable("friend_requests", {
  requestId: serial("request_id").primaryKey(),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.userId),
  receiverId: integer("receiver_id")
    .notNull()
    .references(() => users.userId),
  status: FriendRequestStatus("status").notNull().default("pending"),
  sentAt: timestamp("sent_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Optional message with the friend request
  message: text("message"),
});

export const friendships = pgTable(
  "friendships",
  {
    userId1: integer("user_id_1")
      .notNull()
      .references(() => users.userId),
    userId2: integer("user_id_2")
      .notNull()
      .references(() => users.userId),
    becameFriendsAt: timestamp("became_friends_at").defaultNow(),
    // Optional: Add a boolean for blocking/muting
    isBlocked: boolean("is_blocked").default(false),
  },
  (t) => [primaryKey({ columns: [t.userId1, t.userId2] })]
);

export const groups = pgTable("groups", {
  groupId: serial("group_id").primaryKey(),
  groupName: varchar("group_name", { length: 100 }),
  description: text("description"),
  createdBy: integer("created_by").references(() => users.userId),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const groupMembers = pgTable(
  "group_members",
  {
    groupId: integer("group_id").references(() => groups.groupId),
    userId: integer("user_id").references(() => users.userId),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.groupId, t.userId] })]
);

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

export const userKeys = pgTable("user_keys", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.userId),
  publicKey: varchar("public_key", { length: 255 }).notNull(),
  privateKeyEncrypted: varchar("private_key_encrypted", { length: 255 }),
  keyVersion: integer("key_version").default(1),
});
