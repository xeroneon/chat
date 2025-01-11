import { aliasedTable, eq } from "drizzle-orm";
import { db } from "../db";
import { friendRequests, users } from "../schema";

const users2 = aliasedTable(users, "users2");

export const friendRequestWithUsers = db
  .select({
    requestId: friendRequests.requestId,
    status: friendRequests.status,
    sentAt: friendRequests.sentAt,
    sender: {
      userId: users.userId,
      username: users.username,
      imageUrl: users.imageUrl,
    },
    receiver: {
      userId: users2.userId,
      username: users2.username,
      imageUrl: users2.imageUrl,
    },
  })
  .from(friendRequests)
  .innerJoin(users, eq(friendRequests.senderId, users.userId))
  .innerJoin(users2, eq(friendRequests.receiverId, users2.userId));

export type FriendRequestWithUsers = Awaited<
  ReturnType<typeof friendRequestWithUsers.execute>
>[number];
