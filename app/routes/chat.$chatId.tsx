import { data, LoaderFunctionArgs, ActionFunction } from "@remix-run/node";
import { SearchInput } from "~/components/search-input";
import { db } from "~/db/db";
import { friendRequests, users } from "~/db/schema";
import { and, eq, or, ilike, InferSelectModel } from "drizzle-orm";
import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import UserListItem from "~/components/user-list-item";
import { getAuth } from "@clerk/remix/ssr.server";
import { friendRequestWithUsers } from "~/db/queries/friend-requests";
import FriendRequestListItem from "~/components/friend-request-list-item";
import { getUserFriendsList } from "~/db/queries/friendships";
import TitleSeparator from "~/components/title-separator";
import { getCurrentGroupChatWithMessages } from "~/db/queries/chat";
import { ChatInput } from "~/components/chat-input";

type User = InferSelectModel<typeof users>;

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId: clerkUserId } = await getAuth(args);

  const { chatId } = args.params;

  if (!clerkUserId) {
    return {};
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.internalUserId, clerkUserId));

  const userId = user[0].userId;

  if (!chatId) {
    return data({ error: "No chatId provided" }, { status: 400 });
  }

  const chatData = await getCurrentGroupChatWithMessages(parseInt(chatId, 10));

  console.log(chatData);

  return { chatData };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const searchTerm = formData.get("search") as string;

  if (!searchTerm) {
    return data({ error: "Search term is required" }, { status: 400 });
  }
};

export default function NewChat() {
  const { Form, data } = useFetcher<typeof action>();

  return (
    <div className="grid h-screen grid-rows-[1fr_auto_env(keyboard-inset-height,_0px)] p-4">
      <Link to="/" className="mx-auto mb-4">
        <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      </Link>
      <ChatInput />
    </div>
  );
}
