import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
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
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
      setIsInitialLoad(false);
    } else {
      messagesContainerRef.current.lastElementChild?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [allMessages, isInitialLoad]);

  return (
    <Form
      method="post"
      className="flex flex-col items-center max-h-screen min-h-screen"
    >
      <div className="flex fixed top-0 shadow-lg h-[70px] p-4 w-full z-50 items-center bg-slate-100 dark:bg-slate-900">
        <Link to="/" className="">
          <h1 className="text-2xl font-instrument font-bold">Chat</h1>
        </Link>
      </div>
      <div
        ref={messagesContainerRef}
        className="grow overflow-y-auto pb-4 w-full mt-[55px]"
      >
        {allMessages.map((message) => (
          <Bubble
            key={message.messageId}
            userImage={message?.senderData?.imageUrl}
          >
            {message.content}
          </Bubble>
        ))}
        {allMessages.length <= 0 && <p>No messages have been sent</p>}
      </div>
      <ChatInput />
      <input name="userId" defaultValue={user.userId} className="hidden" />
    </Form>
  );
}
