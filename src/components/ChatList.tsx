"use client";

import { Timestamp } from "firebase/firestore";
import { MehIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ChatListProps = {
  userId: string | undefined;
  chats: Chat[] | undefined;
};

export default function ChatList({ userId, chats }: ChatListProps) {
  return chats ? (
    chats.map((chat) => {
      return (
        <Link
          key={chat.id}
          href={`/dashboard/chat/${chat.id}`}
          className="flex items-center justify-between w-full px-4 lg:px-6 py-4 gap-3 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <div className="flex gap-4 w-2/3">
            <div className="relative size-14 flex-shrink-0">
              <Image
                alt={`${chat.chatName} image`}
                src={chat.chatImage}
                fill
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col justify-center truncate">
              <p className="text-lg lg:text-xl font-bold">{chat.chatName}</p>
              {chat.lastMessage && (
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessageUserId === userId && `you: `}
                  {chat.lastMessage}
                </p>
              )}
            </div>
          </div>

          {chat.timestamp && (
            <span className="flex-shrink-0 text-sm text-muted-foreground">
              {new Timestamp(
                chat.timestamp._seconds,
                chat.timestamp._nanoseconds
              )
                .toDate()
                .toLocaleTimeString("en-US", {
                  timeStyle: "short",
                })}
            </span>
          )}
        </Link>
      );
    })
  ) : (
    <div className="flex flex-col gap-4 w-full items-center">
      <MehIcon className="size-24 md:size-36 stroke-1" />
      <h1 className="text-xl font-bold">No chats</h1>
    </div>
  );
}
