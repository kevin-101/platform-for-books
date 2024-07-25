"use client";

import ErrorComp from "@/components/ErrorComp";
import LoadingComp from "@/components/LoadingComp";
import { auth, db } from "@/lib/firebase";
import {
  CollectionReference,
  DocumentData,
  collection,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

export default function ChatsPage() {
  const [user] = useAuthState(auth);
  const [chats, loading, error] = useCollectionData(
    collection(db, `chats/${user?.uid}/chat-details`) as CollectionReference<
      Chat,
      DocumentData
    >
  );

  if (error) {
    return <ErrorComp />;
  }

  if (loading) {
    return <LoadingComp />;
  }

  return (
    <div className="flex flex-col w-full">
      {chats ? (
        chats.map((chat) => {
          return (
            <Link
              key={chat.id}
              href={`/dashboard/chat/${chat.id}`}
              className="flex items-center justify-between px-4 lg:px-6 py-4 gap-3 hover:bg-orange-100 transition-colors"
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
                  <p className="text-lg lg:text-xl font-bold">
                    {chat.chatName}
                  </p>
                  {chat.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessageUserId === user?.uid && `you: `}
                      {chat.lastMessage}
                    </p>
                  )}
                </div>
              </div>

              {chat.timestamp && (
                <span className="flex-shrink-0 text-sm text-muted-foreground">
                  {chat.timestamp
                    .toDate()
                    .toLocaleTimeString("en-US", { timeStyle: "short" })}
                </span>
              )}
            </Link>
          );
        })
      ) : (
        <h1 className="text-xl font-bold">No chats</h1>
      )}
    </div>
  );
}
