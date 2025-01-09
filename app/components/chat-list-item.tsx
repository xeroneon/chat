import { getChats } from "~/db/queries/chat";
import { ArrayElementType } from "~/types/type-helpers";

type Props = {
  chat: ArrayElementType<Awaited<ReturnType<typeof getChats>>>;
};

export default function ChatListItem({ chat }: Props) {
  return (
    <div className="flex items-center py-4 mt-2">
      {chat.members.map((member) => (
        <p>{member.username}</p>
      ))}
    </div>
  );
}
