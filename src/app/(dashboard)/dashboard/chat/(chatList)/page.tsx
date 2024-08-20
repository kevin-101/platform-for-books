import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export default async function ChatsPage() {
  const idToken = cookies().get("idToken")?.value;
  const domain = process.env.APP_DOMAIN;

  const chatRes = await fetch(`${domain}/api/chats`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!chatRes.ok) {
    throw new Error(chatRes.statusText);
  }

  const chats = (await chatRes.json()).data as Chat[];

  let userId: string | undefined =
    idToken && (await adminAuth?.verifyIdToken(idToken))?.uid;

  return (
    <div className="flex flex-col items-center w-full">
      {chats ? (
        chats.map((chat) => {
          return (
            <Link
              key={chat.id}
              href={`/dashboard/chat/${chat.id}`}
              className="flex items-center justify-between w-full px-4 lg:px-6 py-4 gap-3 hover:bg-orange-100 transition-colors"
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
                      {chat.lastMessageUserId === userId && `you: `}
                      {chat.lastMessage}
                    </p>
                  )}
                </div>
              </div>

              {chat.timestamp && (
                <span className="flex-shrink-0 text-sm text-muted-foreground">
                  {
                    chat.timestamp.seconds
                    // .toDate()
                    // .toLocaleTimeString("en-US", { timeStyle: "short" })
                  }
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
