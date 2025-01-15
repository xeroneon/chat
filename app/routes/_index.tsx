import {
  LoaderFunctionArgs,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { PiChatTeardropDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { getChats } from "~/db/queries/chat";
import ChatListItem from "~/components/chat-list-item";
import { sessionStorage } from "~/services/session.server";
import UserAccountDropdown from "~/components/user-account-dropdown";

export const meta: MetaFunction = () => {
  return [
    { title: "Chat" },
    { name: "description", content: "Welcome to Chat!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user = session.get("user");
  if (!user) throw redirect("/sign-in");
  console.log("before load chats", { user });
  const chats = await getChats(parseInt(user[0].userId, 10));
  console.log("after load chats");

  return { chats, user };
};

export default function Index() {
  const { chats, user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center relative">
      <div className="flex justify-between items-center p-4 w-full">
        <h1 className="text-2xl font-instrument font-bold select-none">Chat</h1>
        <UserAccountDropdown user={user} />
      </div>
      <div className="w-full">
        {chats.map((chat) => (
          <ChatListItem
            key={chat.groupId}
            chat={chat}
            currentUserId={user.userId}
          />
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
