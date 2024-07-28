"use client";

import DashboardSideNav from "@/components/DashboardSideNav";
import MobileNav from "@/components/MobileNav";
import { auth, db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import {
  DocumentData,
  DocumentReference,
  Query,
  collection,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user] = useAuthState(auth, {
    onUserChanged: async (user) => {
      if (!user) {
        router.push("/login");
      }
    },
  });
  const [friendRequests] = useDocumentData(
    doc(db, `incoming-friend-requests/${user?.uid}`) as DocumentReference<
      { ids: string[] },
      DocumentData
    >
  );
  const [recentChatIds] = useDocumentData(
    doc(db, `recent-chats/${user?.uid}`) as DocumentReference<
      { ids: string[] },
      DocumentData
    >
  );

  const [recentChats, setRecentChats] = useState<Chat[]>([]);

  useEffect(() => {
    async function getRecentChats() {
      if (recentChatIds && recentChatIds.ids.length > 0) {
        try {
          const result = await getDocs(
            query(
              collection(db, `chats/${user?.uid}/chat-details`),
              where("id", "in", recentChatIds.ids)
            ) as Query<Chat, DocumentData>
          );

          const chats: Chat[] = [];
          result.forEach((chat) => chats.push(chat.data()));
          setRecentChats(chats);
        } catch (error) {
          console.log(error);
        }
      } else {
        setRecentChats([]);
      }
    }

    getRecentChats();
  }, [recentChatIds]);

  return (
    <div className="w-full h-[100dvh] flex flex-col lg:flex-row">
      <DashboardSideNav
        user={user}
        recentChats={recentChats}
        friendRequests={friendRequests?.ids}
      />
      <MobileNav
        user={user}
        recentChats={recentChats}
        friendRequests={friendRequests?.ids}
      />
      <main
        className={cn("flex-1 w-full pt-11 pl-0 lg:pt-0 lg:pl-96", {
          "pt-0": pathname.includes("/dashboard/chat/"),
        })}
      >
        {children}
      </main>
    </div>
  );
}
