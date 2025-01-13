import { LoaderFunctionArgs } from "@remix-run/node";
import { db } from "../db";
import { User, users } from "../schema";
import { eq } from "drizzle-orm";
import { sessionStorage } from "~/services/session.server";

export async function getUser(email: string) {
  return await db.select().from(users).where(eq(users.email, email));
}

export async function getCurrentUser({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user: User = session.get("user");
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, user.email));
  return userResult[0];
}

type CreateUserParams = {
  username: string;
  email: string;
  passwordHash?: string;
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
      .returning();

    return userResult[0];
  } catch (error) {
    throw error;
  }
}
