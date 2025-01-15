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
        "flex my-4 relative mt-10"
      )}
    >
      {!currentUser && (
        <div className="flex items-center -top-8 left-0 absolute">
          <UserAvatar size={20} user={user} />
          <p className="ml-2 font-bold text-sm">{user.username}</p>
        </div>
      )}
      <div className="text-md border-[3px] bg-white dark:bg-slate-900 border-black dark:border-white w-fit px-2 py-1 rounded-lg">
        {children}
      </div>
      {currentUser && (
        <div className="flex items-center -top-8 right-0 absolute">
          <p className="mr-2 font-bold text-sm">{user.username}</p>
          <UserAvatar size={20} user={user} />
        </div>
      )}
    </div>
  );
}
