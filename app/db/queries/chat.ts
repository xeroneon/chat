import { db } from "../db";
import { groupMembers, groups, messages, users } from "../schema";
import { eq, desc, sql, SQL, asc, inArray } from "drizzle-orm";

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
        imageUrl: users.imageUrl,
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
  if (!group) {
    throw new Error(`No group found with id ${groupId}`);
  }

  return {
    groupId: group.groupId,
    groupName: group.groupName,
    description: group.description,
    createdBy: group.createdBy,
    createdAt: group.createdAt,
    messages: messagesResult || [], // Ensure this is always an array
    members: groupMembersResult || [], // Ensure this is always an array
  };
}

export async function getChats(userId: number) {
  console.log("in chats");
  console.log({ userId });
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
      imageUrl: users.imageUrl,
      messagePreview: sql<string>`
        (SELECT content FROM ${messages}
         WHERE ${messages.groupId} = ${groups.groupId}
         ORDER BY ${messages.sentAt} DESC
         LIMIT 1)
      `.as("message_preview"),
      lastMessageTime: sql<Date>`
        (SELECT ${messages.sentAt} FROM ${messages}
         WHERE ${messages.groupId} = ${groups.groupId}
         ORDER BY ${messages.sentAt} DESC
         LIMIT 1)
      `.as("last_message_time"),
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.groupId))
    .innerJoin(users, eq(groupMembers.userId, users.userId))
    .where(
      inArray(
        groupMembers.groupId,
        db
          .select({ groupId: groupMembers.groupId })
          .from(groupMembers)
          .where(eq(groupMembers.userId, userId))
      )
    )
    .orderBy(desc(sql`last_message_time`));
  console.log({ chats });

  // Group results by groupId
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
          messagePreview: chat.messagePreview,
          lastMessageTime: chat.lastMessageTime,
          members: [
            {
              userId: chat.userId,
              username: chat.username!,
              email: chat.email!,
              imageUrl: chat.imageUrl!,
            },
          ],
        });
      } else {
        existingGroup.members.push({
          userId: chat.userId,
          username: chat.username!,
          email: chat.email!,
          imageUrl: chat.imageUrl!,
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
      messagePreview: string | null;
      lastMessageTime: Date | null;
      members: {
        userId: number;
        username: string;
        email: string;
        imageUrl: string;
      }[];
    }[]
  );

  return groupedChats;
}
