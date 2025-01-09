import { db } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function getInternalUser(clerkUserId: string) {
  return await db
    .select()
    .from(users)
    .where(eq(users.internalUserId, clerkUserId));
}
