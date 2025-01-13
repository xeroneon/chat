import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { ModeToggle } from "~/components/mode-tottle";
import { PiChatTeardropDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
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

  const chats = await getChats(parseInt(user.userId, 10));

  return { chats, user };
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  return redirect("/sign-in", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}

export default function Index() {
  const { chats, user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center relative">
      <div className="flex justify-end p-4 w-full">
        <UserAccountDropdown user={user} />
      </div>
      <h1 className="text-5xl font-instrument font-bold">Chat</h1>
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
