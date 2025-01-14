import {
  ActionFunctionArgs,
  redirect,
  ErrorResponse,
  data,
} from "@remix-run/node";
import { MetaFunction, useFetcher, useLoaderData } from "@remix-run/react";
import React from "react";
import { useTheme } from "remix-themes";
import { authenticator, verifyLogin } from "~/auth/auth";
import { LoginForm } from "~/components/login-form";
import { sessionStorage } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign in to Chat" },
    { name: "description", content: "Sign in to Chat!" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Request body used:", request.bodyUsed);

  const formData = await request.formData();
  console.log("Form data in action:", Object.fromEntries(formData));

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return data({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    const user = await verifyLogin(email, password);
    const session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );
    session.set("user", user);

    return redirect("/", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    return data({ error: "Sign-in failed" }, { status: 401 });
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
