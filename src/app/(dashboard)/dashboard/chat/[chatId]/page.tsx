"use client";

import { useAuthContext } from "@/components/AuthProvider";
import Messages from "@/components/Messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setRecentChat, updateUserChats } from "@/helpers/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import {
  DocumentData,
  DocumentReference,
  Query,
  addDoc,
  collection,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { ArrowLeft, ChevronDownIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  useCollection,
  useDocumentDataOnce,
} from "react-firebase-hooks/firestore";

type ChatPageProps = {
  params: {
    chatId: string;
  };
};

export default function ChatPage({ params: { chatId } }: ChatPageProps) {
  const [user] = useAuthContext();

  const ids = chatId.split("--");
  const friendId = ids[0] === user?.uid ? ids[1] : ids[0];

  const [friend] = useDocumentDataOnce(
    doc(db, `users/${friendId}`) as DocumentReference<User, DocumentData>
  );
  const [serverMessages, loading, error] = useCollection(
    query(
      collection(db, `messages/${chatId}/message-details`),
      orderBy("timestamp", "desc")
    ) as Query<Omit<Message, "messageId">, DocumentData>
  );

  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const [isScrollButton, setIsScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (serverMessages) {
      const mssgs: Message[] = [];
      serverMessages.forEach((mssg) =>
        mssgs.push({ messageId: mssg.id, ...mssg.data() })
      );

      setLocalMessages(mssgs);
    }
  }, [serverMessages]);

  // checks for existing chats in both users
  // if it doesn't exist
  // sets chats for both users
  useEffect(() => {
    async function setUserChats() {
      try {
        if (user && friend && user.uid !== friend.id) {
          const userChat = await getDoc(
            doc(db, `chats/${user.uid}/chat-details/${chatId}`)
          );
          const friendChat = await getDoc(
            doc(db, `chats/${friend.id}/chat-details/${chatId}`)
          );

          if (!userChat.exists()) {
            await setDoc(doc(db, `chats/${user.uid}/chat-details/${chatId}`), {
              id: chatId,
              chatName: friend.displayName,
              chatImage: friend.photoUrl,
              lastMessage: null,
              lastMessageUserId: null,
              timestamp: null,
            });
          }

          if (!friendChat.exists()) {
            await setDoc(doc(db, `chats/${friend.id}/chat-details/${chatId}`), {
              id: chatId,
              chatName: user.displayName,
              chatImage: user.photoURL,
              lastMessage: null,
              lastMessageUserId: null,
              timestamp: null,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    setUserChats();
  }, [user, friend]);

  async function sendMessage() {
    // message field should not be empty and user has to be logged in
    if (messageRef.current?.value.length !== 0 && user) {
      try {
        await addDoc(collection(db, `messages/${chatId}/message-details`), {
          message: messageRef.current!.value,
          userId: user?.uid,
          timestamp: serverTimestamp(),
        });

        await setRecentChat(user.uid, friendId, chatId);
        await updateUserChats(
          chatId,
          user.uid,
          friendId,
          messageRef.current?.value
        );

        bottomRef.current?.scrollIntoView({ behavior: "instant" });
      } catch (error) {
        console.log(error);
      } finally {
        messageRef.current!.value = "";
        messageRef.current?.focus();
      }
    }
  }

  async function handleDivScroll() {
    if (scrollRef.current!.scrollTop < -100) {
      setIsScrollButton(true);
    } else {
      setIsScrollButton(false);
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full">
      <div className="flex w-full justify-start p-3 border-b border-border bg-primary-foreground">
        <div className="flex gap-3 items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <div className="relative h-10 w-10">
            {friend?.photoUrl && (
              <Image
                src={friend?.photoUrl as string}
                alt={`${friend?.displayName} Image`}
                fill
                className="rounded-full"
              />
            )}
          </div>

          <div className="flex flex-col">
            <h2 className="text-xl font-bold transition-all">
              {friend?.displayName}
            </h2>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 relative">
        <div
          ref={scrollRef}
          className="absolute top-0 left-0 w-full h-full flex flex-col-reverse items-center gap-1 px-4 py-2 overflow-y-auto overflow-x-hidden"
          onScroll={() => handleDivScroll()}
        >
          <div ref={bottomRef} />

          {loading ? (
            <Loader2Icon className="size-8 animate-spin" />
          ) : (
            <Messages
              messages={localMessages}
              userId={user?.uid}
              friendId={friendId}
            />
          )}
        </div>

        <Button
          variant="default"
          size="icon"
          className={cn(
            "absolute bottom-2 right-4 md:right-6 rounded-full transition-transform",
            {
              "scale-0": !isScrollButton,
            }
          )}
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: "instant" })
          }
        >
          <ChevronDownIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex gap-3 items-center p-4 bottom-0 bg-primary-foreground border-t border-border">
        <Input
          ref={messageRef}
          type="text"
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <Button
          onClick={() => sendMessage()}
          onTouchEnd={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
