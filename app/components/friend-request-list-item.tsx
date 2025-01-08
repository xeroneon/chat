import { InferSelectModel, eq } from "drizzle-orm";
import React from "react";
import { friendRequests, users } from "~/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { PiPlusCircleDuotone as Add } from "react-icons/pi";
import { useFetcher } from "@remix-run/react";
import { action } from "../routes/action.create-friend-request";
import { useUser } from "@clerk/remix";
import { db } from "~/db/db";
import {
  friendRequestWithUsers,
  FriendRequestWithUsers,
} from "~/db/queries/friend-requests";

type FriendRequest = InferSelectModel<typeof friendRequests>;

type Props = {
  friendRequest: FriendRequestWithUsers;
};

export default function FriendRequestListItem({ friendRequest }: Props) {
  const { sender } = friendRequest;
  const currentUser = useUser();
  const fetcher = useFetcher<typeof action>();

  const handleClick = () => {
    console.log("accepting friend request");
    //fetcher.submit(
    //  { receiverId: user.userId },
    //  { method: "post", action: "/action/create-friend-request" }
    //);
  };

  return (
    <div className="flex items-center py-4 mt-2">
      <Avatar className="mr-4">
        {sender?.imageUrl && <AvatarImage src={sender.imageUrl} />}
        <AvatarFallback>{sender.username}</AvatarFallback>
      </Avatar>
      <h1 className="font-bold text-lg flex-grow">{sender.username}</h1>
      <Button type="button" onClick={handleClick} className="justify-self-end">
        Accept
      </Button>
    </div>
  );
}
