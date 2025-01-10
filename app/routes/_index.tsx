import {
  LoaderFunctionArgs,
  redirect,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { ModeToggle } from "~/components/mode-tottle";
import { PiChatTeardropDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { getChats } from "~/db/queries/chat";
import ChatListItem from "~/components/chat-list-item";
import { authenticator } from "~/auth/auth";
import { sessionStorage } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Chat" },
    { name: "description", content: "Welcome to Chat!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = "10";
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user = session.get("user");
  if (user) throw redirect("/dashboard");

  return {};

  if (!userId) {
    return redirect("/sign-in");
  }

  const chats = await getChats(parseInt(userId, 10));

  return { chats };
};

export default function Index() {
  const { chats } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center relative">
      <div className="flex justify-end p-4 w-full">
        <ModeToggle />
      </div>
      <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      <div className="w-full">
        {chats?.map((chat) => (
          <ChatListItem chat={chat} currentUserId={1} />
        ))}
      </div>
      <Button
        type="button"
        onClick={() => navigate("new-chat")}
        className="fixed right-5 bottom-5 h-16 w-16 rounded-full shadow-xl"
      >
        <PiChatTeardropDuotone size={30} />
      </Button>
    </div>
  );
}
