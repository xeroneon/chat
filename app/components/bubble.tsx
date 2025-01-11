import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Props = {
  content?: string;
  children: React.ReactNode;
  userImage: string | null | undefined;
};

export default function Bubble({ children, userImage }: Props) {
  return (
    <div className="flex items-start my-4">
      <Avatar className="mr-4">
        {userImage && <AvatarImage src={userImage} />}
        <AvatarFallback>{userImage}</AvatarFallback>
      </Avatar>
      <div className="text-xl border-[3px] bg-white dark:bg-slate-900 border-black dark:border-white w-fit px-2 py-1 rounded-lg">
        {children}
      </div>
    </div>
  );
}
