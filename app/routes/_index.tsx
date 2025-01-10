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
import { getInternalUser } from "~/db/queries/users";
import ChatListItem from "~/components/chat-list-item";

export const meta: MetaFunction = () => {
  return [
    { title: "Chat" },
    { name: "description", content: "Welcome to Chat!" },
  ];
};

export const loader = async (args: LoaderFunctionArgs) => {
  const userId = "10";

  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await getInternalUser(userId);

  const chats = await getChats(parseInt(userId, 10));

  return { chats, user: user[0] };
};

export default function Index() {
  const { chats, user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center relative">
      <div className="flex justify-end p-4 w-full">
        <ModeToggle />
      </div>
      <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      <div className="w-full">
        {chats.map((chat) => (
          <ChatListItem chat={chat} currentUserId={user.userId} />
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
