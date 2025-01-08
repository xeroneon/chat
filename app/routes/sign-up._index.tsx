import { SignUp } from "@clerk/remix";
import React from "react";
import { useTheme } from "remix-themes";
import { dark } from "@clerk/themes";
import { MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign up to Chat" },
    { name: "description", content: "Sign up to Chat!" },
  ];
};
export default function Signup() {
  const [theme] = useTheme();
  console.log(theme);
  return (
    <div className="flex flex-col items-center justify-around h-screen">
      <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      <div className="w-fit dark:border-white border-black border-[3px] rounded-[14px]">
        <SignUp
          appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
          signInUrl="/sign-in"
          routing="path"
          path="/sign-up"
        />
      </div>
    </div>
  );
}
