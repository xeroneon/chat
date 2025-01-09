import { db } from "../db";
import { groupMembers, groups, messages, users } from "../schema";
import { eq, desc, sql, SQL } from "drizzle-orm";

type Member = {
  user: {
    userId: number;
    username: string;
    email: string;
  };
};

export async function getCurrentGroupChatWithMessages(groupId: number) {
  // Query for group details with members

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

  // Query for group members
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

  // Query for the last 50 messages
  const messageQuery = db
    .select({
      messageId: messages.messageId,
      content: messages.content,
      senderId: messages.userId,
      sentAt: messages.sentAt,
      senderData: {
        userId: users.userId,
        username: users.username,
        email: users.email, // Assuming these are the user details you want
      },
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.userId))
    .where(eq(messages.groupId, groupId))
    .orderBy(desc(messages.sentAt))
    .limit(50);

  // Execute both queries within a transaction for consistency
  const [groupResult, groupMembersResult, messagesResult] =
    await db.transaction(async (tx) => {
      return Promise.all([groupDetails, groupMembersData, messageQuery]);
    });
  const group = groupResult[0];

  // Combine results
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
    })
    .from(groups)
    .innerJoin(groupMembers, eq(groups.groupId, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId));

  return chats;
}
