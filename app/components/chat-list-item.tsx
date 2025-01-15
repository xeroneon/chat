import { Link } from "@remix-run/react";
import { getChats } from "~/db/queries/chat";
import { ArrayElementType } from "~/types/type-helpers";
import UserAvatar from "./user-avatar";
import { RelativeTime } from "./relative-time";

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
            <UserAvatar key={member.userId} user={member} className="mr-4" />
          );
        })}
        <div className="flex flex-col grow">
          <h1 className="font-bold text-lg">
            {chat.members.length > 2
              ? chat.groupName
              : otherMembers[0]?.username}
          </h1>
          <p className="text-foreground/50">{chat.messagePreview}</p>
        </div>
        <div className="self-baseline">
          {chat.lastMessageTime && (
            <RelativeTime date={new Date(chat.lastMessageTime)} />
          )}
        </div>
      </div>
    </Link>
  );
}
