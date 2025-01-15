import { MetaFunction, useActionData } from "@remix-run/react";
import { ActionFunctionArgs, data, redirect } from "@remix-run/node";
import { SignUpForm } from "~/components/signup-form";
import { createUser, getUser } from "~/db/queries/users";
import * as bcrypt from "bcrypt";
import { sessionStorage } from "~/services/session.server";
import { toast } from "~/hooks/use-toast";

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
    throw data({ errors: { general: "No password provided" } });
  }

  const existingUser = await getUser(email);

  if (existingUser.length) {
    return data({ errors: { userExists: true } }, { status: 500 });
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
  if (actionData?.errors?.userExists) {
    toast({
      title: "User already exists with that email",
      description: "Please sign up using a different email",
      variant: "destructive",
    });
  }

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
