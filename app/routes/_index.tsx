import {
  LoaderFunctionArgs,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { PiChatTeardropDuotone } from "react-icons/pi";
import { Button } from "~/components/ui/button";
import { useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { getChats } from "~/db/queries/chat";
import ChatListItem from "~/components/chat-list-item";
import { sessionStorage } from "~/services/session.server";
import UserAccountDropdown from "~/components/user-account-dropdown";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, x: "100%" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "-100%" },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

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

export default function Index() {
  const location = useLocation();
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
