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
    console.log("Original request body used:", request.bodyUsed);

    // Read the original form data
    const originalFormData = await request.formData();
    console.log("Original form data:", Object.fromEntries(originalFormData));

    // Create a new FormData object
    const newFormData = new FormData();
    for (const [key, value] of originalFormData.entries()) {
      newFormData.append(key, value);
    }

    // Create a new request with the same method, headers, and the new form data
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: newFormData,
    });

    const user = await authenticator.authenticate("form", newRequest);
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
    <Form
      method="post"
      action="/sign-in"
      className="flex flex-col items-center h-screen"
    >
      <h1 className="flex items-center justify-center text-5xl h-40 text-center font-instrument font-bold">
        Chat
      </h1>
      <div className="w-fit">
        <LoginForm />
      </div>
    </Form>
  );
}
