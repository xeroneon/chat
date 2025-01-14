import { Authenticator } from "remix-auth";
import { User } from "~/db/schema";
import bcrypt from "bcrypt";

export const authenticator = new Authenticator<User>();

import { FormStrategy } from "remix-auth-form";
import { GitHubStrategy } from "remix-auth-github";
import { createUser, getUser } from "~/db/queries/users";
import { redirect } from "@remix-run/node";

const verifyLogin = async (email: string, password: string) => {
  const user = await getUser(email);
  if (user.length <= 0 || !user[0]?.passwordHash) {
    throw redirect("/sign-in");
  }
  const match = await bcrypt.compare(password, user[0].passwordHash);
  if (!match) {
    throw redirect("/sign-in");
  }
  return user;
};

authenticator.use(
  new FormStrategy(async ({ form, request }: FormStrategy.VerifyOptions) => {
    const email = form.get("email");
    const password = form.get("password");
    console.log("Email and password:", { email, password });

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await verifyLogin(email.toString(), password.toString());
    if (!user) {
      throw new Error("Invalid credentials");
    }

    return user[0];
  }),
  "form"
);

authenticator.use(
  new GitHubStrategy(
    {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      redirectURI: new URL("http://localhost:5173/auth/github").toString(),
      scopes: ["user:email"], // Add any additional scopes you need
    },
    async ({ request, tokens }) => {
      const data: any = tokens.data;
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${data?.access_token}`,
        },
      });
      const githubUser = await response.json();

      // Fetch user's email (it might not be public)
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${data?.access_token}`,
        },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary)?.email;

      const user = await getUser(primaryEmail);

      if (!user || user.length === 0) {
        const newUser = await createUser({
          username: githubUser.login,
          email: primaryEmail,
          imageUrl: githubUser.avatar_url,
        });
        return newUser;
      }

      return user[0];
    }
  ),
  "github"
);
