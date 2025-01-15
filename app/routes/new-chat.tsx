import {
  data,
  LoaderFunctionArgs,
  ActionFunction,
  ActionFunctionArgs,
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
  ne,
  notInArray,
} from "drizzle-orm";
import {
  Form,
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
import {
  getCurrentUser,
  SearchUsers,
  UserSearchResults,
} from "~/db/queries/users";
import UserSearchListItem from "~/components/user-search-list-item";
import { useRef } from "react";

type User = InferSelectModel<typeof users>;

export const loader = async (args: LoaderFunctionArgs) => {
  const { request } = args;
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("search") as string;
  const currentUser = await getCurrentUser(args);
  const { userId } = currentUser;
  let searchResults;

  if (searchTerm) {
    searchResults = await SearchUsers(searchTerm, currentUser);
  }

  const requests = await friendRequestWithUsers
    .where(
      and(
        eq(friendRequests.receiverId, userId),
        eq(friendRequests.status, "pending")
      )
    )
    .limit(1);

  const friends = await getUserFriendsList(userId);
  return { requests, friends, searchResults };
};

export default function NewChat() {
  const { requests, friends, searchResults } = useLoaderData<typeof loader>();
  const [searchParams, _] = useSearchParams();
  const formRef = useRef(null);

  //const { data: usersData } = useQuery<UserSearchResults>({
  //  queryKey: ["searchUsers", data?.searchResults],
  //  queryFn: () => {
  //    if (!data?.searchResults) return [];
  //    return data.searchResults;
  //  },
  //  enabled: !!data?.searchResults,
  //  staleTime: Infinity,
  //});

  return (
    <div className="flex flex-col p-4 min-h-screen">
      <Link to="/" className="mx-auto mb-4">
        <h1 className="text-5xl font-instrument font-bold">Chat</h1>
      </Link>
      <Form ref={formRef} className="mb-4">
        <SearchInput initialValue={searchParams.get("search") || ""} />
      </Form>

      {!!requests?.length && <TitleSeparator text="Friend Requests" />}
      {requests?.map((request) => (
        <FriendRequestListItem friendRequest={request} />
      ))}

      {searchResults && <TitleSeparator text="Matching Users" />}
      {searchResults && searchResults.length <= 0 && (
        <p>No users found matching that search</p>
      )}
      {searchResults?.map((entry) => (
        <UserSearchListItem
          key={entry.user.userId}
          user={entry.user}
          isFriend={!!entry.friendshipStatus}
          friendshipStatus={entry.friendRequestStatus}
        />
      ))}
      {friends && <TitleSeparator text="Friends" />}
      {friends?.map((user) => (
        <UserListItem key={user.userId} user={user as any} isFriend />
      ))}
    </div>
  );
}
