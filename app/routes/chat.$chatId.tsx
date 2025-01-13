import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import { getCurrentGroupChatWithMessages } from "~/db/queries/chat";
import { ChatInput } from "~/components/chat-input";
import { createMessage } from "~/db/queries/messages";
import Bubble from "~/components/bubble";
import { getCurrentUser } from "~/db/queries/users";
import { redis } from "~/services/redis.server";
import { useEffect, useRef, useState } from "react";
import { isAuthenticated } from "~/utils/isAuthenticated.server";

export const loader = async (args: LoaderFunctionArgs) => {
  const { chatId } = args.params;
  await isAuthenticated(args);
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const eventSource = new EventSource(`/chat/${chatData.groupId}/events`);

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setAllMessages((prev) => [...prev, JSON.parse(message?.data)]);
      setIsInitialLoad(false);
    };

    return () => eventSource.close();
  }, [chatData?.groupId]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;

    if (isInitialLoad) {
      console.log("initial");
      // On initial load, instantly position at bottom without animation
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
      setIsInitialLoad(false);
    } else {
      console.log("not initial");
      // For new messages, smooth scroll to bottom
      messagesContainerRef.current.lastElementChild?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [allMessages, isInitialLoad]);

  return (
    <Form method="post" className="flex flex-col items-center p-4 max-h-screen">
      <div className="flex fixed top-0 shadow-lg mb-4 p-4 w-full z-50 item-center bg-slate-100 dark:bg-slate-900">
        <Link to="/" className="mx-auto">
          <h1 className="text-5xl font-instrument font-bold">Chat</h1>
        </Link>
      </div>
      <div
        ref={messagesContainerRef}
        className="grow mb-10 overflow-y-auto w-full"
      >
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
