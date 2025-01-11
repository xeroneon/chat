import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { getCurrentGroupChatWithMessages } from "~/db/queries/chat";
import { ChatInput } from "~/components/chat-input";
import { createMessage } from "~/db/queries/messages";
import Bubble from "~/components/bubble";
import { getCurrentUser } from "~/db/queries/users";
import { eventStream } from "~/utils/eventStream.server";
import Redis from "ioredis";
import { redis } from "~/services/redis.server";
import { useEffect, useState } from "react";

export const loader = async (args: LoaderFunctionArgs) => {
  const { chatId } = args.params;
  const { request } = args;
  const user = await getCurrentUser(args);

  if (!chatId) {
    throw data({ error: "No chatId provided" }, { status: 400 });
  }

  if (new Headers(request.headers).get("Accept") === "text/event-stream") {
    console.log("creating event stream");
    return eventStream(request, (send) => {
      const listener = (message: string) => {
        send({ event: "message", data: message });
      };
      const channelName = `chat:${chatId}`;

      const subscriber = new Redis(process.env.REDIS_URL!);
      subscriber.subscribe(channelName);
      subscriber.on("message", (channel, message) => listener(message));

      console.log("returning event stream");
      return () => {
        subscriber.quit();
      };
    });
  }

  const chatData = await getCurrentGroupChatWithMessages(parseInt(chatId, 10));

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
  console.log("after publish");

  return { messageResult };
};

export default function Chat() {
  const { chatData, user } = useLoaderData<typeof loader>();
  const messages = [...chatData.messages].reverse();
  const { Form } = useFetcher();
  const [allMessages, setAllMessages] = useState(messages);

  useEffect(() => {
    const eventSource = new EventSource(`/chat/${chatData.chatId}`);

    eventSource.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      console.log("in event listener", { message });
      setAllMessages((prev) => [...prev, message]);
    });

    return () => eventSource.close();
  }, []);

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
      <input name="userId" defaultValue={user.userId} className="hidden" />
    </Form>
  );
}
