import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User } from "~/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PiUserCircleDuotone } from "react-icons/pi";
import { ModeToggle } from "./mode-tottle";

type Props = {
  user: User;
};

export default function UserAccountDropdown({ user }: Props) {
  const { imageUrl } = user;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="mr-4">
          {imageUrl && <AvatarImage src={imageUrl} />}
          <AvatarFallback>
            <PiUserCircleDuotone size={45} />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ModeToggle />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
