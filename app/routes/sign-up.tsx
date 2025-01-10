import React from "react";
import { MetaFunction } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { SignUpForm } from "~/components/signup-form";
import { createUser } from "~/db/queries/users";
import bcrypt from "bcrypt";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign up to Chat" },
    { name: "description", content: "Sign up to Chat!" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("action");
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password");
  if (!password) {
    throw {};
  }
  const passwordHash = await bcrypt.hash(password as string, 10);
  const user = await createUser({
    email,
    passwordHash,
    username,
  });
  console.log({ formData });

  return {};
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
