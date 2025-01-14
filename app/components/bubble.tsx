import React from "react";
import { User } from "~/db/schema";
import UserAvatar from "./user-avatar";

type Props = {
  content?: string;
  children: React.ReactNode;
  user: User;
};

export default function Bubble({ children, user }: Props) {
  return (
    <div className="flex items-start my-4">
      <UserAvatar className="mr-4" user={user} />
      <div className="text-xl border-[3px] bg-white dark:bg-slate-900 border-black dark:border-white w-fit px-2 py-1 rounded-lg">
        {children}
      </div>
    </div>
  );
}
