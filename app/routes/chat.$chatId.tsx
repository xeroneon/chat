import { data, LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { getCurrentGroupChatWithMessages } from "~/db/queries/chat";
import { ChatInput } from "~/components/chat-input";

export const loader = async (args: LoaderFunctionArgs) => {
  const { chatId } = args.params;

  if (!chatId) {
    return data({ error: "No chatId provided" }, { status: 400 });
  }

  const chatData = await getCurrentGroupChatWithMessages(parseInt(chatId, 10));

  console.log(chatData);

  return { chatData };
};

export default function Chat() {
  return (
    <div className="grid h-screen grid-rows-[1fr_auto_env(keyboard-inset-height,_0px)] p-4">
      <Link to="/" className="mx-auto mb-4">
        <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      </Link>
      <ChatInput />
    </div>
  );
}
