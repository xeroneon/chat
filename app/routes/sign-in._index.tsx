import { SignIn } from "@clerk/remix";
import { MetaFunction, useLoaderData } from "@remix-run/react";
import React from "react";
import { useTheme } from "remix-themes";
import { dark } from "@clerk/themes";

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
        <SignIn
          appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
