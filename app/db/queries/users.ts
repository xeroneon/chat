import { LoaderFunctionArgs } from "@remix-run/node";
import { db } from "../db";
import { friendRequests, friendships, User, users } from "../schema";
import { eq, or, and, ilike, ne } from "drizzle-orm";
import { sessionStorage } from "~/services/session.server";

export async function getUser(email: string) {
  return await db.select().from(users).where(eq(users.email, email));
}

export async function getCurrentUser({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user: User = session.get("user");
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, user.email));
  return userResult[0];
}

type CreateUserParams = {
  username: string;
  email: string;
  passwordHash?: string;
  imageUrl?: string;
};

export async function createUser({
  username,
  email,
  imageUrl,
  passwordHash,
}: CreateUserParams) {
  try {
    const userResult = await db
      .insert(users)
      .values({
        username,
        email,
        imageUrl,
        passwordHash,
      })
      .returning();

    return userResult[0];
  } catch (error) {
    throw error;
  }
}

export async function SearchUsers(query: string, currentUser: User) {
  const searchResults = await db
    .select({
      user: users,
      friendshipStatus: friendships.becameFriendsAt,
      friendRequestStatus: friendRequests.status,
    })
    .from(users)
    .leftJoin(
      friendships,
      or(
        and(
          eq(friendships.userId1, users.userId),
          eq(friendships.userId2, currentUser.userId!)
        ),
        and(
          eq(friendships.userId2, users.userId),
          eq(friendships.userId1, currentUser.userId!)
        )
      )
    )
    .leftJoin(
      friendRequests,
      and(
        or(
          and(
            eq(friendRequests.senderId, users.userId),
            eq(friendRequests.receiverId, currentUser.userId!)
          ),
          and(
            eq(friendRequests.receiverId, users.userId),
            eq(friendRequests.senderId, currentUser.userId!)
          )
        ),
        eq(friendRequests.status, "pending")
      )
    )
    .where(
      and(
        or(
          ilike(users.username, `%${query}%`),
          ilike(users.email, `%${query}%`)
        ),
        ne(users.userId, currentUser.userId!)
      )
    );

  return searchResults;
}

export type UserSearchResults = Awaited<ReturnType<typeof SearchUsers>>;
