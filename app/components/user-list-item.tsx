import { InferSelectModel } from "drizzle-orm";
import { users } from "~/db/schema";
import { Button } from "./ui/button";
import { PiPlusCircleDuotone as Add } from "react-icons/pi";
import { useFetcher } from "@remix-run/react";
import { action } from "../routes/action.create-friend-request";
import { MouseEvent, KeyboardEvent } from "react";
import UserAvatar from "./user-avatar";

type User = InferSelectModel<typeof users>;

type Props = {
  user: User;
  isFriend: boolean;
};

export default function UserListItem({ user, isFriend = false }: Props) {
  const fetcher = useFetcher<typeof action>();

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    fetcher.submit(
      { receiverId: user.userId },
      { method: "post", action: "/action/create-friend-request" }
    );
  };

  const handleCreateChat = () => {
    const formData = new FormData();
    [user.userId].forEach((id) => {
      formData.append("userIds", id.toString());
    });

    fetcher.submit(formData, {
      method: "post",
      action: "/action/create-chat",
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCreateChat();
    }
  };

  return (
    <div
      onClick={handleCreateChat}
      onKeyDown={handleKeyDown}
      className="flex items-center py-4 mt-2 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg transition-colors"
      role="button"
      tabIndex={0}
      aria-label={`Create chat with ${user.username}`}
    >
      <UserAvatar className="mr-4" user={user} />
      <h1 className="font-bold text-lg flex-grow">{user.username}</h1>
      {!isFriend && (
        <Button
          type="button"
          onClick={handleClick}
          variant="ghost"
          className="justify-self-end"
        >
          <Add size={30} />
        </Button>
      )}
    </div>
  );
}
