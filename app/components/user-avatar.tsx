import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "~/db/schema";
import GravatarImage from "./gravatar-image";
import clsx from "clsx";

type Props = {
  user: User;
  className?: string;
};

export default function UserAvatar({ user, className }: Props) {
  return (
    <Avatar className={clsx("border-[3px] border-black", className)}>
      {user.imageUrl && <AvatarImage src={user.imageUrl} />}
      <AvatarFallback>
        <GravatarImage email={user.email} />
      </AvatarFallback>
    </Avatar>
  );
}
