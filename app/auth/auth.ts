import { Authenticator } from "remix-auth";
import { User } from "~/db/schema";
import bcrypt from "bcrypt";

export const authenticator = new Authenticator<User>();

import { FormStrategy } from "remix-auth-form";
import { getInternalUser, getUser } from "~/db/queries/users";

const verifyLogin = async (email: string, password: string) => {
  const user = await getUser(email);
  const hash = await bcrypt.hash(password, 10);
};

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await verifyLogin(email.toString(), password.toString());
    if (!user) {
      throw new Error("Invalid credentials");
    }

    return user;
  }),
  "form"
);
