import React from "react";
import { User } from "~/db/schema";
import UserAvatar from "./user-avatar";
import clsx from "clsx";

type Props = {
  content?: string;
  children: React.ReactNode;
  user: User;
  currentUser?: boolean;
};

export default function Bubble({ children, user, currentUser = false }: Props) {
  return (
    <div
      className={clsx(
        currentUser ? "justify-end" : "justify-start",
        "flex my-4"
      )}
    >
      {!currentUser && <UserAvatar className="mr-4" user={user} />}
      <div className="text-xl border-[3px] bg-white dark:bg-slate-900 border-black dark:border-white w-fit px-2 py-1 rounded-lg">
        {children}
      </div>
      {currentUser && <UserAvatar className="ml-4" user={user} />}
    </div>
  );
}
