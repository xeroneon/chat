import { data, LoaderFunctionArgs, ActionFunction } from "@remix-run/node";
import { SearchInput } from "~/components/search-input";
import { db } from "~/db/db";
import { users } from "~/db/schema";
import { or, like } from "drizzle-orm";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const initialUsers = await db.select().from(users).limit(10); // Limit for initial load
  return { initialUsers };
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
        like(users.username, `%${searchTerm}%`),
        like(users.email, `%${searchTerm}%`)
      )
    );

  return { searchResults };
};

export default function NewChat() {
  const [searchParams, _] = useSearchParams();
  const { initialUsers } = useLoaderData<typeof loader>();
  const { Form, data } = useFetcher<typeof action>();
  console.log({ actionData: data });

  const { data: usersData } = useQuery({
    queryKey: ["searchUsers", data?.searchResults], // Key includes search results to avoid unnecessary fetches
    queryFn: () => data?.searchResults || initialUsers, // Use search results if available, otherwise fall back to initial data
    enabled: !!data?.searchResults, // Only fetch if there's new search data
    staleTime: Infinity, // Adjust based on how often you want to refetch
  });
  console.log({ usersData });

  return (
    <div className="flex flex-col p-4 min-h-screen">
      <Form method="post">
        <SearchInput initialValue={searchParams.get("search") || ""} />
      </Form>
    </div>
  );
}
