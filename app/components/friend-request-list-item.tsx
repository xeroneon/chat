import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useFetcher } from "@remix-run/react";
import { action } from "../routes/action.create-friend-request";
import { FriendRequestWithUsers } from "~/db/queries/friend-requests";
import { PiUserCircleDuotone } from "react-icons/pi";

type Props = {
  friendRequest: FriendRequestWithUsers;
};

export default function FriendRequestListItem({ friendRequest }: Props) {
  const { sender, requestId } = friendRequest;
  const fetcher = useFetcher<typeof action>();

  const handleClick = () => {
    console.log("accepting friend request");
    fetcher.submit(
      { requestId },
      { method: "post", action: "/action/accept-friend-request" }
    );
  };

  return (
    <div className="flex items-center py-4 mt-2">
      <Avatar className="mr-4">
        {sender?.imageUrl && <AvatarImage src={sender.imageUrl} />}
              <AvatarFallback>
                <PiUserCircleDuotone size={45} />
              </AvatarFallback>
      </Avatar>
      <h1 className="font-bold text-lg flex-grow">{sender.username}</h1>
      <Button type="button" onClick={handleClick} className="justify-self-end">
        Accept
      </Button>
    </div>
  );
}
