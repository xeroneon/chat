import { InferSelectModel } from "drizzle-orm";
import { users } from "~/db/schema";
import { Button } from "./ui/button";
import { PiPlusCircleDuotone as Add, PiClockUserDuotone } from "react-icons/pi";
import { useFetcher } from "@remix-run/react";
import { action } from "../routes/action.create-friend-request";
import { MouseEvent, KeyboardEvent } from "react";
import UserAvatar from "./user-avatar";
import { useQueryClient } from "@tanstack/react-query";

type User = InferSelectModel<typeof users>;

type Props = {
  user: User;
  isFriend: boolean;
  friendshipStatus: "pending" | "accepted" | "rejected" | null;
};

export default function UserSearchListItem({
  user,
  isFriend,
  friendshipStatus,
}: Props) {
  console.log({ isFriend, friendshipStatus });
  const queryClient = useQueryClient();
  const fetcher = useFetcher<typeof action>();

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    fetcher.submit(
      { receiverId: user.userId },
      { method: "post", action: "/action/create-friend-request" }
    );
  };

  return (
    <div
      className="flex items-center py-4 mt-2 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg transition-colors"
      role="button"
      tabIndex={0}
      aria-label={`Create chat with ${user.username}`}
    >
      <UserAvatar className="mr-4" user={user} />
      <h1 className="font-bold text-lg flex-grow">{user.username}</h1>
      <div className="justify-self-end">
        {!isFriend && friendshipStatus !== "pending" && (
          <Button type="button" onClick={handleClick} variant="ghost">
            <Add size={30} />
          </Button>
        )}
        {friendshipStatus === "pending" && (
          <Button type="button" disabled variant="ghost">
            <PiClockUserDuotone size={30} />
          </Button>
        )}
      </div>
    </div>
  );
}
