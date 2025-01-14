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
    // Clone the request
    console.log("Request method:", request.method);
    console.log("Request headers:", Object.fromEntries(request.headers));
    console.log("Request body used:", request.bodyUsed);

    let formData;
    try {
      formData = await request.formData();
      console.log("Form data in action:", Object.fromEntries(formData));
    } catch (error) {
      console.error("Error reading form data:", error);
    }

    const user = await authenticator.authenticate("form", request);
    console.log({ user });
    const session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );
    session.set("user", user);

    return redirect("/", {
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
