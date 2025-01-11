import { eq, inArray, sql } from "drizzle-orm";
import { ActionFunction, data, redirect } from "@remix-run/node";
import { db } from "~/db/db";
import { groupMembers, groups, users } from "~/db/schema";
import { getCurrentUser } from "~/db/queries/users";

async function createGroupAndMembers(
  groupName: string,
  description: string,
  creatorId: number,
  memberIds: number[]
) {
  try {
    return await db.transaction(async (tx) => {
      const [newGroup] = await tx
        .insert(groups)
        .values({
          groupName: groupName,
          description: description,
          createdBy: creatorId,
        })
        .returning({ groupId: groups.groupId });

      if (newGroup) {
        const memberData = memberIds.map((userId) => ({
          groupId: newGroup.groupId,
          userId: userId,
        }));

        await tx.insert(groupMembers).values(memberData);
      }
      return newGroup.groupId;
    });
  } catch (error) {
    console.error("Failed to create group or add members:", error);
    throw error; // or handle it as needed
  }
}

export const action: ActionFunction = async (args) => {
  const { request } = args;
  const { userId } = await getCurrentUser(args);

  const formData = await request.formData();
  const userIds = formData.getAll("userIds") as string[];

  const countOfUsers = userIds.length + 1;

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
        [...userIds, userId.toString()]
          .map((id) => parseInt(id, 10))
          .filter(Boolean)
      )
    )
    .groupBy(groups.groupId, groups.groupName)
    .having(sql`COUNT(DISTINCT ${groupMembers.userId}) = ${countOfUsers}`)
    .limit(1);

  if (existingGroups.length) {
    return redirect(`/chat/${existingGroups[0].groupId}`);
  }

  const groupId = await createGroupAndMembers(
    "test name",
    "test desc",
    userId,
    [userId, ...userIds.map((id) => parseInt(id, 10))]
  );
  return redirect(`/chat/${groupId}`);
};
