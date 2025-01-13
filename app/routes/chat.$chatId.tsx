import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import { getCurrentGroupChatWithMessages } from "~/db/queries/chat";
import { ChatInput } from "~/components/chat-input";
import { createMessage } from "~/db/queries/messages";
import Bubble from "~/components/bubble";
import { getCurrentUser } from "~/db/queries/users";
import { redis } from "~/services/redis.server";
import { useEffect, useRef, useState } from "react";

export const loader = async (args: LoaderFunctionArgs) => {
  const { chatId } = args.params;
  const user = await getCurrentUser(args);

  const chatData = await getCurrentGroupChatWithMessages(parseInt(chatId!, 10));

  return { chatData, user };
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

  const channelName = `chat:${chatId}`;

  await redis.publish(channelName, JSON.stringify(messageResult));

  return { messageResult };
};

export default function Chat() {
  const { chatData, user } = useLoaderData<typeof loader>();
  const messages = [...chatData.messages].reverse();
  const { Form } = useFetcher();
  const [allMessages, setAllMessages] = useState(messages);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/chat/${chatData.groupId}/events`);

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setAllMessages((prev) => [...prev, JSON.parse(message?.data)]);
    };

    return () => eventSource.close();
  }, [chatData?.groupId]);

  useEffect(() => {
    if (messagesContainerRef && messagesContainerRef.current) {
      messagesContainerRef.current.lastElementChild?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [allMessages]);

  return (
    <Form
      method="post"
      className="chat-container flex flex-col items-center p-4"
    >
      <Link to="/" className="mx-auto mb-4">
        <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      </Link>
      <div ref={messagesContainerRef} className="grow overflow-y-auto w-full">
        {allMessages.map((message) => (
          <Bubble
            key={message.messageId}
            userImage={message?.senderData?.imageUrl}
          >
            {message.content}
          </Bubble>
        ))}
      </div>
      <ChatInput />
      <input name="userId" defaultValue={user.userId} className="hidden" />
    </Form>
  );
}
