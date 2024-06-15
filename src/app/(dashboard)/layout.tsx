"use client";

import DashboardSideNav from "@/components/DashboardSideNav";
import MobileNav from "@/components/MobileNav";
import { auth, db } from "@/lib/firebase";
import { collection } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
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
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  return (
    <div className="w-full h-[100dvh] flex flex-col lg:flex-row">
      <DashboardSideNav user={user} friendRequests={friendRequests} />
      <MobileNav user={user} friendRequests={friendRequests} />
      <div className="flex-1 w-full overflow-y-auto">{children}</div>
    </div>
  );
}
