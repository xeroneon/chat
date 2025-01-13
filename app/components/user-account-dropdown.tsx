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
import { Form, useFetcher } from "@remix-run/react";
import { Button } from "./ui/button";

type Props = {
  user: User;
};

export default function UserAccountDropdown({ user }: Props) {
  const { imageUrl } = user;
  const fetcher = useFetcher();
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
      <DropdownMenuContent className="mr-4">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <fetcher.Form method="post" action="/action/sign-out">
          <DropdownMenuItem>
            <Button type="submit">Log Out</Button>
          </DropdownMenuItem>
        </fetcher.Form>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ModeToggle />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
