"use client";

import DashboardSideNav from "@/components/DashboardSideNav";
import MobileNav from "@/components/MobileNav";
import { auth, db } from "@/lib/firebase";
import {
  CollectionReference,
  DocumentData,
  Query,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, _, __] = useAuthState(auth);
  const [friendRequests, reqLoading, reqError] = useCollectionData(
    collection(db, `user:${user?.uid}:incoming-friend-requests`)
  );
  const [recentChatIds] = useCollectionData(
    collection(db, `user:${user?.uid}:recent-chats`) as CollectionReference<
      { id: string },
      DocumentData
    >
  );
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function getRecentChats() {
      if (recentChatIds?.length !== 0 || recentChatIds === undefined) {
        const chatIdArray: string[] = [];
        recentChatIds?.forEach(({ id }) => chatIdArray.push(id));

        try {
          const result = await getDocs(
            query(
              collection(db, `user:${user?.uid}:chats`),
              where("id", "in", chatIdArray)
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

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  return (
    <div className="w-full h-[100dvh] flex flex-col lg:flex-row">
      <DashboardSideNav
        user={user}
        recentChats={recentChats}
        friendRequests={friendRequests}
      />
      <MobileNav
        user={user}
        recentChats={recentChats}
        friendRequests={friendRequests}
      />
      <div className="flex-1 w-full overflow-y-auto">{children}</div>
    </div>
  );
}
