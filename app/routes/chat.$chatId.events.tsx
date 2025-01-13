import type { LoaderFunctionArgs } from "@remix-run/node";
import Redis from "ioredis";
import { eventStream } from "~/utils/eventStream.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { chatId } = params;

  if (!chatId) {
    throw new Error("No chatId provided");
  }

  return eventStream(request, (send) => {
    const channelName = `chat:${chatId}`;
    const subscriber = new Redis(process.env.REDIS_URL!);

    subscriber.on("ready", () => {
      subscriber.subscribe(channelName);
    });

    subscriber.on("message", (channel, message) => {
      send({ event: "message", data: message });
    });

    return () => {
      subscriber.unsubscribe(channelName).then(() => subscriber.quit());
    };
  });
};
