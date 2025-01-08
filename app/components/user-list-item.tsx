import { InferSelectModel, eq } from "drizzle-orm";
import React from "react";
import { users } from "~/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { PiPlusCircleDuotone as Add } from "react-icons/pi";
import { useFetcher } from "@remix-run/react";
import { action } from "../routes/action.create-friend-request";
import { useUser } from "@clerk/remix";
import { db } from "~/db/db";

type User = InferSelectModel<typeof users>;

type Props = {
  user: User;
};

export default function UserListItem({ user }: Props) {
  const currentUser = useUser();
  const fetcher = useFetcher<typeof action>();
  const handleClick = () => {
    fetcher.submit(
      { receiverId: user.userId },
      { method: "post", action: "/action/create-friend-request" }
    );
  };
  return (
    <div className="flex items-center py-4 mt-2">
      <Avatar className="mr-4">
        {user?.imageUrl && <AvatarImage src={user.imageUrl} />}
        <AvatarFallback>{user.username}</AvatarFallback>
      </Avatar>
      <h1 className="font-bold text-lg flex-grow">{user.username}</h1>
      <Button
        type="button"
        onClick={handleClick}
        variant="ghost"
        className="justify-self-end"
      >
        <Add size={30} />
      </Button>
    </div>
  );
}
