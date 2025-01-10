import { db } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function getUser(email: string) {
  return await db.select().from(users).where(eq(users.email, email));
}

type CreateUserParams = {
  username: string;
  email: string;
  passwordHash: string;
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
      .returning({
        username: users.username,
        email: users.email,
        imageUrl: users.imageUrl,
      });

    console.log("User created successfully");
    return userResult[0];
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
}
