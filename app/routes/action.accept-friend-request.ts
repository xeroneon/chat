import { InferSelectModel, eq, and } from "drizzle-orm";
import { ActionFunction, data } from "@remix-run/node";
import { db } from "~/db/db";
import { friendRequests, friendships, users } from "~/db/schema";
import { getAuth } from "@clerk/remix/ssr.server";

export const action: ActionFunction = async (args) => {
  const { request } = args;
  const { userId } = await getAuth(args);
  const result = await db
    .select()
    .from(users)
    .where(eq(users.internalUserId, userId!));

  if (result.length <= 0) {
    return data(
      { error: "No current user id available, please log in" },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const requestId = parseInt(formData.get("requestId") as string);

  const friendRequest = await db
    .select()
    .from(friendRequests)
    .where(eq(friendRequests.requestId, requestId));

  await db
    .update(friendRequests)
    .set({
      status: "accepted",
    })
    .where(eq(friendRequests.requestId, requestId));

  await db.insert(friendships).values({
    userId1: friendRequest[0].receiverId,
    userId2: friendRequest[0].senderId,
  });
  return {};
};
