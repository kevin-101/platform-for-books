"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "./ui/button";
import Image from "next/image";
import { SheetClose } from "./ui/sheet";
import { usePathname } from "next/navigation";
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  getDocs,
  Query,
  query,
  where,
} from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "@/lib/firebase";
import {
  BookIcon,
  LucideIcon,
  MessageCircle,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { useAuthContext } from "./AuthProvider";
import { Skeleton } from "./ui/skeleton";

type NavLinksProps = {
  inSheet?: boolean;
};

export type LinkType = {
  href: string;
  icon: LucideIcon;
  name: string;
};

const navLinks: LinkType[] = [
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

export default function NavLinks({ inSheet = false }: NavLinksProps) {
  const pathname = usePathname();
  const [user] = useAuthContext();

  const [friendRequestsDoc] = useDocumentData(
    doc(db, `incoming-friend-requests/${user?.uid}`) as DocumentReference<
      { ids: string[] },
      DocumentData
    >
  );
  const [recentChatIds, recentChatsLoading] = useDocumentData(
    doc(db, `recent-chats/${user?.uid}`) as DocumentReference<
      { ids: string[] },
      DocumentData
    >
  );

  const [recentChats, setRecentChats] = useState<Chat[]>([]);

  const linkRefs = useRef<(HTMLLIElement | null)[]>([]);

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

  useEffect(() => {
    linkRefs.current[0]?.scrollIntoView();
  }, [pathname]);

  return (
    <>
      <div className="flex flex-col gap-4 items-start justify-center w-full">
        <h3 className="text-muted-foreground text-lg font-bold">
          Recent Chats
        </h3>

        <ul className="flex flex-col gap-2 w-full pl-2 min-h-40">
          {recentChatsLoading
            ? [...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    buttonVariants({ size: "lg", variant: "ghost" })
                  )}
                />
              ))
            : recentChats?.map((chat) => {
                return (
                  <li key={chat.id}>
                    {inSheet ? (
                      <SheetClose asChild>
                        <Link
                          href={`/dashboard/chat/${chat.id}`}
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "lg",
                              className:
                                "flex items-center justify-start gap-4 text-base font-bold hover:bg-primary hover:text-primary-foreground truncate",
                            }),
                            {
                              "bg-primary text-primary-foreground":
                                pathname === `/dashboard/chat/${chat.id}`,
                            }
                          )}
                        >
                          <div className="shrink-0 relative size-8">
                            <Image
                              src={chat.chatImage}
                              alt={chat.chatName + "image"}
                              fill
                              className="rounded-full"
                            />
                          </div>
                          {chat.chatName}
                        </Link>
                      </SheetClose>
                    ) : (
                      <Link
                        href={`/dashboard/chat/${chat.id}`}
                        className={cn(
                          buttonVariants({
                            variant: "ghost",
                            size: "lg",
                            className:
                              "flex items-center justify-start gap-4 text-base font-bold hover:bg-primary hover:text-primary-foreground truncate",
                          }),
                          {
                            "bg-primary text-primary-foreground":
                              pathname === `/dashboard/chat/${chat.id}`,
                          }
                        )}
                      >
                        <div className="shrink-0 relative size-8">
                          <Image
                            src={chat.chatImage}
                            alt={chat.chatName + "image"}
                            fill
                            className="rounded-full"
                          />
                        </div>
                        {chat.chatName}
                      </Link>
                    )}
                  </li>
                );
              })}
        </ul>
      </div>

      <div className="flex flex-col gap-4 items-start justify-center w-full">
        <h3 className="text-muted-foreground text-lg font-bold">Overview</h3>

        <ul className="flex flex-col gap-2 w-full pl-2">
          {navLinks.map((link, i) => {
            return (
              <li
                key={i + link.href}
                ref={(element) => {
                  linkRefs.current.push(element);
                }}
              >
                {inSheet ? (
                  <SheetClose asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                          size: "lg",
                          className:
                            "group flex items-center justify-start gap-4 text-base font-bold hover:bg-primary hover:text-primary-foreground",
                        }),
                        {
                          "justify-between":
                            link.href === "/dashboard/friend-requests" &&
                            friendRequestsDoc?.ids?.length,
                          "bg-primary text-primary-foreground":
                            pathname === link.href,
                        }
                      )}
                    >
                      <div className="flex gap-4 items-center">
                        <span className="border border-primary group-hover:border-primary-foreground p-1 rounded-lg transition-colors">
                          <link.icon className="h-5 w-5 group-hover:stroke-primary-foreground" />
                        </span>
                        {link.name}
                      </div>
                      {link.href === "/dashboard/friend-requests" &&
                        friendRequestsDoc?.ids &&
                        friendRequestsDoc?.ids.length > 0 && (
                          <span className="flex items-center justify-center bg-red-600 rounded-full p-2 w-6 h-6 text-sm">
                            {friendRequestsDoc?.ids?.length}
                          </span>
                        )}
                    </Link>
                  </SheetClose>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      buttonVariants({
                        variant: "ghost",
                        size: "lg",
                        className:
                          "group flex items-center justify-start gap-4 text-base font-bold hover:bg-primary hover:text-primary-foreground",
                      }),
                      {
                        "justify-between":
                          link.href === "/dashboard/friend-requests" &&
                          friendRequestsDoc?.ids?.length,
                        "bg-primary text-primary-foreground":
                          pathname === link.href,
                      }
                    )}
                  >
                    <div className="flex gap-4 items-center">
                      <span className="border border-primary group-hover:border-primary-foreground p-1 rounded-lg transition-colors">
                        <link.icon className="h-5 w-5 group-hover:stroke-primary-foreground" />
                      </span>
                      {link.name}
                    </div>
                    {link.href === "/dashboard/friend-requests" &&
                      friendRequestsDoc?.ids &&
                      friendRequestsDoc?.ids.length > 0 && (
                        <span className="flex items-center justify-center bg-red-600 rounded-full p-2 w-6 h-6 text-sm">
                          {friendRequestsDoc?.ids?.length}
                        </span>
                      )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
