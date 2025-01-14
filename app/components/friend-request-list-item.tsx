import { Button } from "./ui/button";
import { useFetcher } from "@remix-run/react";
import { action } from "../routes/action.create-friend-request";
import { FriendRequestWithUsers } from "~/db/queries/friend-requests";
import UserAvatar from "./user-avatar";
import { User } from "~/db/schema";

type Props = {
  friendRequest: FriendRequestWithUsers;
};

export default function FriendRequestListItem({ friendRequest }: Props) {
  const { sender, requestId } = friendRequest;
  const fetcher = useFetcher<typeof action>();

  const handleClick = () => {
    fetcher.submit(
      { requestId },
      { method: "post", action: "/action/accept-friend-request" }
    );
  };

  return (
    <div className="flex items-center py-4 mt-2">
      <UserAvatar className="mr-4" user={sender as User} />
      <h1 className="font-bold text-lg flex-grow">{sender.username}</h1>
      <Button type="button" onClick={handleClick} className="justify-self-end">
        Accept
      </Button>
    </div>
  );
}
