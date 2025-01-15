import { ActionFunctionArgs, data, redirect } from "@remix-run/node";
import {
  Form,
  MetaFunction,
  useActionData,
  useFetcher,
} from "@remix-run/react";
import { verifyLogin } from "~/auth/auth";
import { LoginForm } from "~/components/login-form";
import { toast } from "~/hooks/use-toast";
import { sessionStorage } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign in to Chat" },
    { name: "description", content: "Sign in to Chat!" },
  ];
};
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return data({ error: "Email or password required" }, { status: 400 });
    }

    const user = await verifyLogin(email.toString(), password.toString());

    if (user.length <= 0) {
      return data({ error: "No matching user found" }, { status: 400 });
    }

    const session = await sessionStorage.getSession(
      request.headers.get("cookie")
    );

    session.set("user", user[0]);

    return redirect("/", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  } catch (error) {
    return data({ error: "Sign-in failed" }, { status: 500 });
  }
};
export default function Signin() {
  const actionData = useActionData<typeof action>();
  if (actionData?.error) {
    toast({
      title: actionData.error,
      variant: "destructive",
    });
  }
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
