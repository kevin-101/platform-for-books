import ChatList from "@/components/ChatList";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

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
      <ChatList userId={userId} chats={chats} />
    </div>
  );
}
