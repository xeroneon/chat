import { db } from "../db";
import { groupMembers, groups, messages, users } from "../schema";

type CreateMessageParams = {
  groupId: number;
  userId: number;
  content?: string;
  mediaType?: string;
  mediaPath?: string;
  thumbnailPath?: string;
};

export async function createMessage({
  groupId,
  userId,
  content,
  mediaType,
  mediaPath,
  thumbnailPath,
}: CreateMessageParams): Promise<void> {
  try {
    const messageResult = await db.insert(messages).values({
      groupId,
      userId,
      content: content || null,
      mediaType: mediaType ? (mediaType as any) : null,
      mediaPath: mediaPath || null,
      thumbnailPath: thumbnailPath || null,
    });

    console.log("Message created successfully");

    return messageResult[0];
  } catch (error) {
    console.error("Failed to create message:", error);
    throw error; // or handle the error as needed
  }
}

// Example usage:
// createMessage({
//   groupId: 1,
//   userId: 2,
//   content: "Hello, World!",
//   mediaType: "image",
//   mediaPath: "/path/to/image.jpg",
//   thumbnailPath: "/path/to/thumbnail.jpg"
// });
