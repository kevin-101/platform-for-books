"use client";

import {
  BookIcon,
  Loader2,
  LogOut,
  LucideIcon,
  MessageCircle,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import { User } from "firebase/auth";
import { DocumentData } from "firebase/firestore";

type DashboardSideNavProps = {
  className?: ClassValue;
  user: User | null | undefined;
  friendRequests: DocumentData[] | undefined;
};

export type LinkType = {
  href: string;
  icon: LucideIcon;
  name: string;
};

export const navLinks: LinkType[] = [
  {
    href: "/dashboard/search-books",
    icon: BookIcon,
    name: "Search Books",
  },
  {
    href: "/dashboard/chat",
    icon: MessageCircle,
    name: "Chat",
  },
  {
    href: "/dashboard/friends",
    icon: UsersIcon,
    name: "Friends",
  },
  {
    href: "/dashboard/add-friend",
    icon: UserPlusIcon,
    name: "Add Friend",
  },
  {
    href: "/dashboard/friend-requests",
    icon: UserIcon,
    name: "Friend Requests",
  },
];

export const chats = [
  {
    name: "Example User",
    href: "/dashboard/chat/dummyuserid",
  },
];

export default function DashboardSideNav({
  className,
  user,
  friendRequests,
}: DashboardSideNavProps) {
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);

  return (
    <nav
      className={cn(
        "h-screen p-4 hidden lg:flex items-start justify-between gap-2 flex-col min-w-96 border-r border-orange-200 bg-orange-50",
        className
      )}
    >
      <div className="flex flex-col items-start justify-center gap-2 w-full">
        <Link
          href="/dashboard"
          className="text-3xl font-bold hidden lg:block mb-10"
        >
          Dashboard
        </Link>
        <div className="lg:flex flex-col gap-12 items-start w-full hidden">
          <div className="flex flex-col gap-4 items-start justify-center w-full">
            <h3 className="text-muted-foreground text-lg font-bold">
              Recent Chats
            </h3>
            <ul className="flex flex-col gap-2 w-full pl-2">
              {chats.map((chat, i) => {
                return (
                  <li key={i + chat.href}>
                    <Link
                      href={chat.href}
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                          size: "lg",
                          className:
                            "flex items-center justify-start gap-4 text-base font-bold hover:bg-orange-100",
                        })
                      )}
                    >
                      {chat.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-4 items-start justify-center w-full">
            <h3 className="text-muted-foreground text-lg font-bold">
              Overview
            </h3>
            <ul className="flex flex-col gap-2 w-full pl-2">
              {navLinks.map((link, i) => {
                return (
                  <li key={i + link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                          size: "lg",
                          className:
                            "group flex items-center justify-start gap-4 text-base font-bold hover:bg-orange-100",
                        }),
                        {
                          "justify-between":
                            link.href === "/dashboard/friend-requests" &&
                            friendRequests?.length !== 0,
                        }
                      )}
                    >
                      <div className="flex gap-4 items-center">
                        <span className="border border-orange-200 group-hover:border-orange-400 p-1 rounded-lg transition-colors">
                          <link.icon className="h-5 w-5 stroke-orange-500" />
                        </span>
                        {link.name}
                      </div>
                      {link.href === "/dashboard/friend-requests" &&
                        friendRequests?.length !== 0 && (
                          <span className="flex items-center justify-center bg-red-600 rounded-full p-2 w-6 h-6 text-sm">
                            {friendRequests?.length}
                          </span>
                        )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-center justify-between py-4 w-full">
        <div className="flex gap-4 items-center">
          <div className="relative h-12 w-12">
            <Image
              src={user?.photoURL as string}
              alt={user?.displayName as string}
              fill
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">{user?.displayName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Button variant="ghost" className="h-full" onClick={() => signOut()}>
          {signOutLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
        </Button>
      </div>
    </nav>
  );
}
