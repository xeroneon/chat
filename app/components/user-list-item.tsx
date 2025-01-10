import { InferSelectModel, eq } from "drizzle-orm";
import { users } from "~/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { PiPlusCircleDuotone as Add } from "react-icons/pi";
import { useFetcher } from "@remix-run/react";
import { action } from "../routes/action.create-friend-request";

type User = InferSelectModel<typeof users>;

type Props = {
  user: User;
};

export default function UserListItem({ user }: Props) {
  const fetcher = useFetcher<typeof action>();

  const handleClick = () => {
    fetcher.submit(
      { receiverId: user.userId },
      { method: "post", action: "/action/create-friend-request" }
    );
  };

  const handleComponentClick = () => {
    const formData = new FormData();
    [user.userId].forEach((id) => {
      formData.append("userIds", id.toString());
    });

    fetcher.submit(formData, {
      method: "post",
      action: "/action/create-chat",
    });
  };

  return (
    <div onClick={handleComponentClick} className="flex items-center py-4 mt-2">
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
