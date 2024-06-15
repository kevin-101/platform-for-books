import Image from "next/image";
import Link from "next/link";

type Chat = {
  name: string;
  chatId: string;
  lastMessage: string;
  image: string;
};

// mock data. To be replaced with actual data passed as a prop
const chats: Chat[] = [
  {
    name: "Placeholder Name",
    chatId: "placeholder-id",
    lastMessage: "placeholder last message",
    image: "/favicon.ico",
  },
  {
    name: "Placeholder Name",
    chatId: "placeholder-id",
    lastMessage: "placeholder last message",
    image: "/favicon.ico",
  },
  {
    name: "Placeholder Name",
    chatId: "placeholder-id",
    lastMessage: "placeholder last message",
    image: "/favicon.ico",
  },
];

export default function ChatsPage() {
  return (
    <div className="flex flex-col w-full">
      {chats.map((chat, i) => {
        return (
          <Link
            href={`/dashboard/chat/${chat.chatId}`}
            className="flex items-center justify-start pl-4 lg:pl-14 py-4 gap-3 lg:gap-6 hover:bg-orange-100 transition-colors"
          >
            <div className="relative h-14 w-14 rounded-full">
              <Image alt={chat.name} src={chat.image} fill />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-lg lg:text-xl font-bold">{chat.name}</p>
              <p className="text-sm text-muted-foreground">
                {chat.lastMessage}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
