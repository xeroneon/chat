import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  redirect,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { ModeToggle } from "~/components/mode-tottle";
import { db } from "~/db/db";

export const meta: MetaFunction = () => {
  return [
    { title: "Chat" },
    { name: "description", content: "Welcome to Chat!" },
  ];
};

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/signin");
  }

  return {};
};

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="flex justify-end p-4 w-full">
        <ModeToggle />
        <UserButton />
      </div>
      <h1 className="text-5xl font-instrument font-bold">Chat</h1>
    </div>
  );
}
