import { data, LoaderFunctionArgs, ActionFunction } from "@remix-run/node";
import { SearchInput } from "~/components/search-input";
import { db } from "~/db/db";
import { friendRequests, friendships, users } from "~/db/schema";
import { and, eq, or, ilike, InferSelectModel } from "drizzle-orm";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import UserListItem from "~/components/user-list-item";

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

type User = InferSelectModel<typeof users>;

export default function NewChat() {
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
      <Form method="post">
        <SearchInput initialValue={searchParams.get("search") || ""} />
      </Form>
      {usersData?.map((user) => (
        <UserListItem key={user.userId} user={user} />
      ))}
    </div>
  );
}
