import {
  data,
  LoaderFunctionArgs,
  ActionFunction,
  ActionFunctionArgs,
} from "@remix-run/node";
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
import { friendRequestWithUsers } from "~/db/queries/friend-requests";
import FriendRequestListItem from "~/components/friend-request-list-item";
import { getUserFriendsList } from "~/db/queries/friendships";
import TitleSeparator from "~/components/title-separator";
import { getCurrentUser } from "~/db/queries/users";

type User = InferSelectModel<typeof users>;

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getCurrentUser(args);

  const requests = await friendRequestWithUsers
    .where(
      and(
        eq(friendRequests.receiverId, userId),
        eq(friendRequests.status, "pending")
      )
    )
    .limit(1);

  const friends = await getUserFriendsList(userId);
  return { requests, friends };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const searchTerm = formData.get("search") as string;

  if (!searchTerm) {
    throw data({ error: "Search term is required" }, { status: 400 });
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
  const { requests, friends } = useLoaderData<typeof loader>();
  const [searchParams, _] = useSearchParams();
  const { Form, data } = useFetcher<typeof action>();

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
      <Link to="/" className="mx-auto mb-4">
        <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      </Link>
      <Form className="mb-4" method="post">
        <SearchInput initialValue={searchParams.get("search") || ""} />
      </Form>

      {!!requests?.length && <TitleSeparator text="Friend Requests" />}
      {requests?.map((request) => (
        <FriendRequestListItem friendRequest={request} />
      ))}

      {usersData && <TitleSeparator text="Matching Users" />}
      {usersData?.map((user) => (
        <UserListItem key={user.userId} user={user} />
      ))}
      {friends && <TitleSeparator text="Friends" />}
      {friends?.map((user) => (
        <UserListItem key={user.userId} user={user as any} />
      ))}
    </div>
  );
}
