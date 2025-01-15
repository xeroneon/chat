import React, { useState } from "react";
import { User } from "~/db/schema";
import UserAvatar from "./user-avatar";
import clsx from "clsx";

type Props = {
  content?: string;
  children: React.ReactNode;
  user: User;
  currentUser?: boolean;
  hideAvatar?: boolean;
  sentAt?: string;
};

export default function Bubble({
  children,
  user,
  hideAvatar = true,
  currentUser = false,
  sentAt,
}: Props) {
  const [showSentAt, setShowSentAt] = useState(false);
  return (
    <div
      className={clsx(
        currentUser ? "justify-end" : "justify-start",
        hideAvatar ? "-mt-2" : "mt-10",
        "flex my-4 relative"
      )}
      onClick={() => setShowSentAt(!showSentAt)}
    >
      {!currentUser && (
        <div
          className={clsx(
            hideAvatar && "hidden",
            "flex items-center -top-8 left-0 absolute"
          )}
        >
          <UserAvatar size={20} user={user} />
          <p className="ml-2 font-bold text-sm">{user.username}</p>
        </div>
      )}
      <div className="text-md border-[3px] bg-white dark:bg-slate-900 border-black dark:border-white w-fit px-2 py-1 rounded-lg">
        {children}
        <p
          className={clsx(
            showSentAt ? "" : "hidden",
            "text-xs font-bold text-foreground/45"
          )}
        >
          {sentAt}
        </p>
      </div>
      {currentUser && (
        <div
          className={clsx(
            hideAvatar && "hidden",
            "flex items-center -top-8 right-0 absolute"
          )}
        >
          <p className="mr-2 font-bold text-sm">{user.username}</p>
          <UserAvatar size={20} user={user} />
        </div>
      )}
    </div>
  );
}
