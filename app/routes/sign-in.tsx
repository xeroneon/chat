import { ActionFunctionArgs, redirect, ErrorResponse } from "@remix-run/node";
import { MetaFunction, useFetcher, useLoaderData } from "@remix-run/react";
import React from "react";
import { useTheme } from "remix-themes";
import { authenticator } from "~/auth/auth";
import { LoginForm } from "~/components/login-form";
import { sessionStorage } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign in to Chat" },
    { name: "description", content: "Sign in to Chat!" },
  ];
};
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Your existing sign-in logic here
    const user = await authenticator.authenticate("form", request);
    const session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );
    session.set("user", user);

    throw redirect("/", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    // You can throw a more specific error here if needed
    throw new Response("Sign-in failed", { status: 500 });
  }
};
export default function Signin() {
  const { Form } = useFetcher();
  return (
    <Form method="post" className="flex flex-col items-center h-screen">
      <h1 className="flex items-center justify-center text-5xl h-40 text-center font-instrument font-bold">
        Chat
      </h1>
      <div className="w-fit">
        <LoginForm />
      </div>
    </Form>
  );
}
