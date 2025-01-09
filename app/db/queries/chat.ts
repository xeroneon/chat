import { db } from "../db";
import { groupMembers, groups, messages, users } from "../schema";
import { eq, desc, sql, SQL } from "drizzle-orm";

export async function getCurrentGroupChatWithMessages(groupId: number) {
  const groupDetails = await db
    .select({
      groupId: groups.groupId,
      groupName: groups.groupName,
      description: groups.description,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .where(eq(groups.groupId, groupId));

  const groupMembersData = await db
    .select({
      userId: users.userId,
      username: users.username,
      email: users.email,
      imageUrl: users.imageUrl,
    })
    .from(groupMembers)
    .leftJoin(users, eq(groupMembers.userId, users.userId))
    .where(eq(groupMembers.groupId, groupId));

  const messageQuery = db
    .select({
      messageId: messages.messageId,
      content: messages.content,
      senderId: messages.userId,
      sentAt: messages.sentAt,
      senderData: {
        userId: users.userId,
        username: users.username,
        email: users.email,
      },
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.userId))
    .where(eq(messages.groupId, groupId))
    .orderBy(desc(messages.sentAt))
    .limit(50);

  const [groupResult, groupMembersResult, messagesResult] =
    await db.transaction(async (tx) => {
      return Promise.all([groupDetails, groupMembersData, messageQuery]);
    });
  const group = groupResult[0];

  return {
    groupId: group.groupId,
    groupName: group.groupName,
    description: group.description,
    createdBy: group.createdBy,
    createdAt: group.createdAt,
    messages: messagesResult,
    members: groupMembersResult,
  };
}

export async function getChats(userId: number) {
  const chats = await db
    .select({
      groupId: groups.groupId,
      groupName: groups.groupName,
      description: groups.description,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
      userId: users.userId,
      username: users.username,
      email: users.email,
    })
    .from(groups)
    .leftJoin(groupMembers, eq(groups.groupId, groupMembers.groupId))
    .leftJoin(users, eq(groupMembers.userId, users.userId));

  // Group results by groupId in TypeScript since Drizzle doesn't support this out of the box
  const groupedChats = chats.reduce(
    (acc, chat) => {
      const existingGroup = acc.find((g) => g.groupId === chat.groupId);
      if (!existingGroup) {
        acc.push({
          groupId: chat.groupId,
          groupName: chat.groupName,
          description: chat.description,
          createdBy: chat.createdBy,
          createdAt: chat.createdAt,
          members: chat.userId
            ? [
                {
                  userId: chat.userId,
                  username: chat.username!,
                  email: chat.email!,
                },
              ]
            : [],
        });
      } else if (chat.userId) {
        existingGroup.members.push({
          userId: chat.userId,
          username: chat.username!,
          email: chat.email!,
        });
      }
      return acc;
    },
    [] as {
      groupId: number;
      groupName: string | null;
      description: string | null;
      createdBy: number | null;
      createdAt: Date;
      members: { userId: number; username: string; email: string }[];
    }[]
  );

  return groupedChats;
}
