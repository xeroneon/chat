import React from "react";
import { MetaFunction } from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { SignUpForm } from "~/components/signup-form";
import { createUser } from "~/db/queries/users";
import * as bcrypt from "bcrypt";
import { authenticator } from "~/auth/auth";
import { sessionStorage } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign up to Chat" },
    { name: "description", content: "Sign up to Chat!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password");
  if (!password) {
    throw {};
  }
  const passwordHash = await bcrypt.hash(password as string, 10);
  console.log(passwordHash, email, username);
  const user = await createUser({
    email,
    passwordHash,
    username,
  });

  console.log({ formData });
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
    <div className="flex flex-col items-center justify-around h-screen">
      <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      <div className="w-fit dark:border-white border-black border-[3px] rounded-[10px]">
        <SignUpForm />
      </div>
    </div>
  );
}
