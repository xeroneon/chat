import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { getCurrentGroupChatWithMessages } from "~/db/queries/chat";
import { ChatInput } from "~/components/chat-input";
import { createMessage } from "~/db/queries/messages";
import { getInternalUser } from "~/db/queries/users";
import { getAuth } from "@clerk/remix/ssr.server";
import Bubble from "~/components/bubble";

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);
  const { chatId } = args.params;

  if (!chatId) {
    throw data({ error: "No chatId provided" }, { status: 400 });
  }

  if (!userId) {
    throw data({ error: "No chatId provided" }, { status: 400 });
  }

  const chatData = await getCurrentGroupChatWithMessages(parseInt(chatId, 10));
  const userData = await getInternalUser(userId);

  return { chatData, userData: userData[0] };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { chatId } = params;
  const formData = await request.formData();
  const message = formData.get("message") as string;
  const userId = formData.get("userId") as string;

  if (!chatId || !userId) {
    return {};
  }

  const messageResult = await createMessage({
    groupId: parseInt(chatId, 10),
    userId: parseInt(userId, 10),
    content: message,
  });

  return { messageResult };
};

export default function Chat() {
  const { chatData, userData } = useLoaderData<typeof loader>();
  const messages = [...chatData.messages].reverse();
  const { Form } = useFetcher();

  return (
    <Form
      method="post"
      className="chat-container flex flex-col items-center p-4"
    >
      <Link to="/" className="mx-auto mb-4">
        <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      </Link>
      <div className="grow overflow-y-auto w-full">
        {messages.map((message) => (
          <Bubble
            key={message.messageId}
            userImage={message?.senderData?.imageUrl}
          >
            {message.content}
          </Bubble>
        ))}
      </div>
      <ChatInput />
      <input name="userId" defaultValue={userData.userId} className="hidden" />
    </Form>
  );
}
