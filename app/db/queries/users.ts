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
}: CreateUserParams): Promise<void> {
  try {
    await db.insert(users).values({
      username,
      email,
      imageUrl,
      passwordHash,
    });

    console.log("User created successfully");
  } catch (error) {
    console.error("Failed to create user:", error);
    // Here you might want to throw the error or handle it differently based on your needs
    throw error;
  }
}
