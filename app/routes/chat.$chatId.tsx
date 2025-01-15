import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { getCurrentGroupChatWithMessages } from "~/db/queries/chat";
import { ChatInput } from "~/components/chat-input";
import { createMessage } from "~/db/queries/messages";
import Bubble from "~/components/bubble";
import { getCurrentUser, getUser } from "~/db/queries/users";
import { redis } from "~/services/redis.server";
import { useEffect, useRef, useState } from "react";
import { isAuthenticated } from "~/utils/isAuthenticated.server";
import { User } from "~/db/schema";

export const loader = async (args: LoaderFunctionArgs) => {
  const { chatId } = args.params;
  await isAuthenticated(args);
  const user = await getCurrentUser(args);

  const chatData = await getCurrentGroupChatWithMessages(parseInt(chatId!, 10));

  return { chatData, user };
};

export const action = async (args: ActionFunctionArgs) => {
  const { request, params } = args;
  const { chatId } = params;
  const formData = await request.formData();
  const message = formData.get("message") as string;
  const userId = formData.get("userId") as string;

  if (!chatId || !userId) {
    return {};
  }

  const user = getCurrentUser(args);

  const messageResult = await createMessage({
    groupId: parseInt(chatId, 10),
    userId: parseInt(userId, 10),
    content: message,
  });

  const channelName = `chat:${chatId}`;

  await redis.publish(
    channelName,
    JSON.stringify({ ...messageResult, senderData: user })
  );

  return { messageResult };
};

export default function Chat() {
  const { chatData, user } = useLoaderData<typeof loader>();
  const messages = [...chatData.messages].reverse();
  const { Form, data } = useFetcher<typeof action>();
  const [allMessages, setAllMessages] = useState(messages);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.reset();
    }
  }, [data]);

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
      ref={formRef}
      method="post"
      className="flex flex-col items-center max-h-dvh min-h-screen"
    >
      <div className="flex fixed top-0 shadow-lg h-[70px] p-4 w-full z-50 items-center bg-slate-100 dark:bg-slate-900">
        <Link to="/" className="">
          <h1 className="text-2xl font-instrument font-bold">Chat</h1>
        </Link>
      </div>
      <div
        ref={messagesContainerRef}
        className="grow overflow-y-auto p-4 w-full mt-[55px]"
      >
        {allMessages.map((message) => (
          <Bubble key={message.messageId} user={message.senderData as User}>
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
