"use client";

import {
  BookIcon,
  EllipsisVerticalIcon,
  Loader2,
  LogOutIcon,
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
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type DashboardSideNavProps = {
  className?: ClassValue;
  user: User | null | undefined;
  recentChats: Chat[] | undefined;
  friendRequests: string[] | undefined;
};

export type LinkType = {
  href: string;
  icon: LucideIcon;
  name: string;
};

export const navLinks: LinkType[] = [
  {
    href: "/dashboard/search",
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

export default function DashboardSideNav({
  className,
  user,
  recentChats,
  friendRequests,
}: DashboardSideNavProps) {
  const [signOut, signOutLoading] = useSignOut(auth);
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "h-screen p-4 hidden lg:flex items-start justify-between gap-2 flex-col w-96 border-r border-orange-200 bg-orange-50",
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
              {recentChats?.map((chat) => {
                return (
                  <li key={chat.id}>
                    <Link
                      href={`/dashboard/chat/${chat.id}`}
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                          size: "lg",
                          className:
                            "flex items-center justify-start gap-4 text-base font-bold hover:bg-orange-100 truncate",
                        }),
                        {
                          "bg-orange-100":
                            pathname === `/dashboard/chat/${chat.id}`,
                        }
                      )}
                    >
                      <div className="relative size-8">
                        <Image
                          src={chat.chatImage}
                          alt={chat.chatName + "image"}
                          fill
                          className="rounded-full"
                        />
                      </div>
                      {chat.chatName}
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
                            friendRequests?.length,
                          "bg-orange-100": pathname === link.href,
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
                        friendRequests &&
                        friendRequests.length > 0 && (
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
            {user?.photoURL && (
              <Image
                src={user?.photoURL as string}
                alt={user?.displayName as string}
                fill
                className="rounded-full"
              />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">{user?.displayName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="h-full">
            <Button variant="ghost" className="h-full">
              <EllipsisVerticalIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              {signOutLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Logout"
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
