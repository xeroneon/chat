import { InferSelectModel, eq, and } from "drizzle-orm";
import { ActionFunction, data } from "@remix-run/node";
import { db } from "~/db/db";
import { friendRequests, users } from "~/db/schema";
import { getCurrentUser } from "~/db/queries/users";

export const action: ActionFunction = async (args) => {
  const { userId } = await getCurrentUser(args);
  const { request } = args;
  const result = await db.select().from(users).where(eq(users.userId, userId!));

  if (result.length <= 0) {
    return data(
      { error: "No current user id available, please log in" },
      { status: 400 }
    );
  }

  const senderId = result[0].userId;
  const formData = await request.formData();
  const receiverId = parseInt(formData.get("receiverId") as string);
  console.log({ senderId, receiverId });

  const exists = await db
    .select()
    .from(friendRequests)
    .where(
      and(
        eq(friendRequests.receiverId, receiverId),
        eq(friendRequests.senderId, senderId)
      )
    );
  console.log({ exists });

  if (exists.length > 0) {
    console.log("in exists if");
    return data(
      { error: "This request has already been created" },
      { status: 400 }
    );
  }

  console.log(`creating friend request with ${receiverId} and ${senderId}`);
  await db.insert(friendRequests).values({
    senderId: senderId,
    receiverId: receiverId,
  });
  console.log(`created friend request with ${receiverId} and ${senderId}`);
  return {};
};
