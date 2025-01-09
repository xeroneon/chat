import { eq, inArray, sql } from "drizzle-orm";
import { ActionFunction, data, redirect } from "@remix-run/node";
import { db } from "~/db/db";
import {
  friendRequests,
  friendships,
  groupMembers,
  groups,
  users,
} from "~/db/schema";
import { getAuth } from "@clerk/remix/ssr.server";

async function createGroupAndMembers(
  groupName: string,
  description: string,
  creatorId: number,
  memberIds: number[]
) {
  try {
    let groupId: number;
    await db.transaction(async (tx) => {
      const [newGroup] = await tx
        .insert(groups)
        .values({
          groupName: groupName,
          description: description,
          createdBy: creatorId,
        })
        .returning({ groupId: groups.groupId });

      groupId = newGroup.groupId;

      if (newGroup) {
        const memberData = memberIds.map((userId) => ({
          groupId: newGroup.groupId,
          userId: userId,
        }));

        await tx.insert(groupMembers).values(memberData);
      }
    });

    console.log("Group and members created successfully.");
  } catch (error) {
    console.error("Failed to create group or add members:", error);
    throw error; // or handle it as needed
  }
}

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

  const currentUserId = result[0].userId;

  const formData = await request.formData();
  const receiverId = parseInt(formData.get("receiverId") as string);
  const userIds = formData.getAll("userIds") as string[];

  //const chat = await db
  //  .select()
  //  .from(groups)
  //  .where(eq(groups., requestId));

  const countOfUsers = userIds.length;

  const existingGroups = await db
    .select({
      groupId: groups.groupId,
      groupName: groups.groupName,
    })
    .from(groups)
    .leftJoin(groupMembers, eq(groups.groupId, groupMembers.groupId))
    .where(
      inArray(
        groupMembers.userId,
        [...userIds, currentUserId.toString()]
          .map((id) => parseInt(id, 10))
          .filter(Boolean)
      )
    )
    .groupBy(groups.groupId, groups.groupName)
    .having(sql`COUNT(DISTINCT ${groupMembers.userId}) = ${countOfUsers}`)
    .limit(1);
  console.log({ existingGroups });

  const group = await createGroupAndMembers(
    "test name",
    "test desc",
    currentUserId,
    [currentUserId, ...userIds.map((id) => parseInt(id, 10))]
  );
  return {};
};
