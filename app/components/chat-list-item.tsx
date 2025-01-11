import { Link } from "@remix-run/react";
import { getChats } from "~/db/queries/chat";
import { ArrayElementType } from "~/types/type-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PiUserCircleDuotone } from "react-icons/pi";

type Props = {
  chat: ArrayElementType<Awaited<ReturnType<typeof getChats>>>;
  currentUserId: number;
};

export default function ChatListItem({ chat, currentUserId }: Props) {
  const otherMembers = chat.members.filter(
    (member) => member.userId != currentUserId
  );
  return (
    <Link to={`/chat/${chat.groupId}`}>
      <div className="flex items-center active:bg-slate-300 dark:active:bg-slate-700 p-4 mt-2 w-full">
        {otherMembers.map((member) => {
          return (
            <Avatar key={member.userId} className="mr-4">
              {member?.imageUrl && <AvatarImage src={member.imageUrl} />}
              <AvatarFallback>
                <PiUserCircleDuotone size={45} />
              </AvatarFallback>
            </Avatar>
          );
        })}
        <h1 className="font-bold text-lg">
          {chat.members.length > 2 ? chat.groupName : otherMembers[0].username}
        </h1>
      </div>
    </Link>
  );
}
