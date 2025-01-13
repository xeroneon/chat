import { MetaFunction } from "@remix-run/react";
import { ActionFunctionArgs, data, redirect } from "@remix-run/node";
import { SignUpForm } from "~/components/signup-form";
import { createUser, getUser } from "~/db/queries/users";
import * as bcrypt from "bcrypt";
import { sessionStorage } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign up to Chat" },
    { name: "description", content: "Sign up to Chat!" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password");

  if (!password) {
    throw {};
  }

  const existingUser = await getUser(email);

  if (existingUser.length) {
    return data(
      { errors: { general: "This user already exists" } },
      { status: 500 }
    );
  }

  const passwordHash = await bcrypt.hash(password as string, 10);

  const user = await createUser({
    email,
    passwordHash,
    username,
  });

  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  session.set("user", user);

  throw redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
};

export default function Signup() {
  return (
    <div className="flex flex-col items-center h-screen">
      <h1 className="flex items-center justify-center h-40 text-5xl font-instrument font-bold">
        Chat
      </h1>
      <div className="w-fit">
        <SignUpForm />
      </div>
    </div>
  );
}
