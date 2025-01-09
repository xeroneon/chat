import { db } from "../db";
import { friendships, users } from "../schema";
import { and, or, eq } from "drizzle-orm";

export const getUserFriendsList = (userId: number) =>
  db
    .select({
      userId: users.userId,
      username: users.username,
      email: users.email,
      imageUrl: users.imageUrl,
      becameFriendsAt: friendships.becameFriendsAt,
    })
    .from(friendships)
    .where(
      and(
        or(eq(friendships.userId1, userId), eq(friendships.userId2, userId)),
        eq(friendships.isBlocked, false)
      )
    )
    .innerJoin(
      users,
      or(
        and(
          eq(friendships.userId1, userId),
          eq(users.userId, friendships.userId2)
        ),
        and(
          eq(friendships.userId2, userId),
          eq(users.userId, friendships.userId1)
        )
      )
    );
