import { MetaFunction, useLoaderData } from "@remix-run/react";
import React from "react";
import { useTheme } from "remix-themes";
import { LoginForm } from "~/components/login-form";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign in to Chat" },
    { name: "description", content: "Sign in to Chat!" },
  ];
};
export default function Signin() {
  const [theme] = useTheme();
  console.log(theme);
  return (
    <div className="flex flex-col items-center justify-around h-screen">
      <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      <div className="w-fit dark:border-white border-black border-[3px] rounded-[14px]">
        <LoginForm />
      </div>
    </div>
  );
}
