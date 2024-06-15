"use client";

import Messages from "@/components/Messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import {
  DocumentData,
  DocumentReference,
  Query,
  addDoc,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { ArrowLeft, ChevronDownIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  useCollectionData,
  useDocumentDataOnce,
} from "react-firebase-hooks/firestore";

type ChatPageProps = {
  params: {
    chatId: string;
  };
};

export default function ChatPage({ params }: ChatPageProps) {
  const { chatId } = params;
  const router = useRouter();
  const [user] = useAuthState(auth);
  const ids = chatId.split("--");
  const friendId = ids[0] === user?.uid ? ids[1] : ids[0];
  const [friend] = useDocumentDataOnce<User>(
    doc(db, `users/${friendId}`) as DocumentReference<User, DocumentData>
  );

  const [messages, loading, error] = useCollectionData<Message>(
    query(
      collection(db, `chat:${chatId}:messages`),
      orderBy("timestamp", "desc")
    ) as Query<Message, DocumentData>
  );

  const [isScrollButton, setIsScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLInputElement>(null);

  async function sendMessage() {
    if (messageRef.current?.value.length !== 0 && user) {
      try {
        await addDoc(collection(db, `chat:${chatId}:messages`), {
          message: messageRef.current?.value,
          userId: user?.uid,
          timestamp: serverTimestamp(),
        });
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
      } catch (error) {
        console.log(error);
      } finally {
        messageRef.current!.value = "";
        messageRef.current?.focus();
      }
    }
  }

  function handleDivScroll() {
    if (scrollRef.current!.scrollTop < -100) {
      setIsScrollButton(true);
    } else {
      setIsScrollButton(false);
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex w-full justify-start p-3 border-b border-orange-200 bg-primary-foreground">
        <div className="flex gap-3 items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="relative h-10 w-10">
            <Image
              src={friend?.photoUrl as string}
              alt={`${friend?.displayName} Image`}
              fill
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold transition-all">
              {friend?.displayName}
            </h2>
            {/* <p className="text-muted-foreground hidden">online</p> */}
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
            <Loader2Icon className="h-8 w-8" />
          ) : (
            <Messages
              messages={messages}
              userId={user?.uid}
              friendId={friendId}
            />
          )}
        </div>

        <Button
          variant="default"
          size="icon"
          className={cn(
            "absolute bottom-4 right-10 rounded-full transition-transform",
            {
              "scale-0": !isScrollButton,
            }
          )}
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <ChevronDownIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex gap-3 items-center p-4 bottom-0 bg-primary-foreground border-t border-orange-200">
        <Input
          ref={messageRef}
          type="text"
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <Button onClick={() => sendMessage()}>Send</Button>
      </div>
    </div>
  );
}
