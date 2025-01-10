import { MetaFunction, useActionData } from "@remix-run/react";
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
  if (existingUser) {
    return data(
      { errors: { general: "An error occurred while signing up" } },
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
  const actionData = useActionData<typeof action>();
  console.log({ actionData });
  return (
    <div className="flex flex-col items-center justify-around h-screen">
      <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      <div className="w-fit dark:border-white border-black border-[3px] rounded-[10px]">
        <SignUpForm />
      </div>
    </div>
  );
}
