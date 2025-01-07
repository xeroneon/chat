import { UserButton } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  redirect,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { ModeToggle } from "~/components/mode-tottle";
import { PiChatTeardropDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";

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
    <div className="min-h-screen flex flex-col items-center relative">
      <div className="flex justify-end p-4 w-full">
        <ModeToggle />
        <UserButton />
      </div>
      <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      <Button className="fixed right-5 bottom-5 h-16 w-16 rounded-full shadow-xl">
        <PiChatTeardropDuotone size={30} />
      </Button>
    </div>
  );
}
