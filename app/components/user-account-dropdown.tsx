import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User } from "~/db/schema";
import { ModeToggle } from "./mode-tottle";
import { useFetcher } from "@remix-run/react";
import { Button } from "./ui/button";
import UserAvatar from "./user-avatar";

type Props = {
  user: User;
};

export default function UserAccountDropdown({ user }: Props) {
  const fetcher = useFetcher();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar user={user} />
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
