import {
  data,
  LoaderFunctionArgs,
  ActionFunction,
  LoaderFunction,
} from "@remix-run/node";
import { SearchInput } from "~/components/search-input";
import { db } from "~/db/db";
import { friendRequests, friendships, users } from "~/db/schema";
import {
  and,
  eq,
  or,
  ilike,
  InferSelectModel,
  aliasedTable,
} from "drizzle-orm";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import UserListItem from "~/components/user-list-item";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  FriendRequestWithUsers,
  friendRequestWithUsers,
} from "~/db/queries/friend-requests";
import FriendRequestListItem from "~/components/friend-request-list-item";

type User = InferSelectModel<typeof users>;
type FriendRequest = InferSelectModel<typeof friendRequests>;

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);

  if (!userId) {
    return {};
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.internalUserId, userId));

  const requests = await friendRequestWithUsers
    .where(eq(friendRequests.receiverId, user[0].userId))
    .limit(1);

  return { requests };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const searchTerm = formData.get("search") as string;

  if (!searchTerm) {
    return data({ error: "Search term is required" }, { status: 400 });
  }

  const searchResults = await db
    .select()
    .from(users)
    .where(
      or(
        ilike(users.username, `%${searchTerm}%`),
        ilike(users.email, `%${searchTerm}%`)
      )
    );

  return { searchResults };
};

export default function NewChat() {
  const { requests } = useLoaderData<typeof loader>();
  const [searchParams, _] = useSearchParams();
  const { Form, data } = useFetcher<typeof action>();
  console.log({ requests });

  const { data: usersData } = useQuery<User[]>({
    queryKey: ["searchUsers", data?.searchResults],
    queryFn: () => {
      if (!data?.searchResults) return [];
      return data.searchResults;
    },
    enabled: !!data?.searchResults,
    staleTime: Infinity,
  });

  return (
    <div className="flex flex-col p-4 min-h-screen">
      <Form method="post">
        <SearchInput initialValue={searchParams.get("search") || ""} />
      </Form>

      {requests && <h1>Friend Requests</h1>}
      {requests?.map((request) => (
        <FriendRequestListItem friendRequest={request} />
      ))}

      {usersData && <h1>Matching Users</h1>}
      {usersData?.map((user) => (
        <UserListItem key={user.userId} user={user} />
      ))}
    </div>
  );
}
