"use client";

import { ClassValue } from "clsx";
import { LinkType, navLinks } from "./DashboardSideNav";
import {
  EllipsisVerticalIcon,
  HomeIcon,
  Loader2,
  MenuIcon,
  MessageCircle,
  SearchIcon,
} from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
  SheetDescription,
  SheetTitle,
  SheetHeader,
  SheetFooter,
} from "@/components/ui/sheet";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { useParams, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type MobileNavProps = {
  className?: ClassValue;
  user: User | null | undefined;
  recentChats: Chat[] | undefined;
  friendRequests: string[] | undefined;
};

const mobileNavLinks: LinkType[] = [
  {
    href: "/dashboard",
    icon: HomeIcon,
    name: "Dashboard",
  },
  {
    href: "/dashboard/chat",
    icon: MessageCircle,
    name: "Chat",
  },
  {
    href: "explore",
    icon: SearchIcon,
    name: "Explore",
  },
];

export default function MobileNav({
  className,
  user,
  recentChats,
  friendRequests,
}: MobileNavProps) {
  const [signOut, loading] = useSignOut(auth);
  const pathname = usePathname();
  const { chatId } = useParams<{ chatId: string }>();

  return (
    <header
      className={cn(
        "flex lg:hidden w-full justify-end px-2 py-1 border-b border-orange-200 bg-orange-50",
        className,
        {
          hidden: pathname === `/dashboard/chat/${chatId}`,
        }
      )}
    >
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="sm">
            <div className="relative">
              <MenuIcon className="h-5 w-5" />
              {friendRequests && friendRequests.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-600 rounded-full" />
              )}
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent
          className="z-[9999] flex flex-col justify-between gap-4 h-full pt-4 px-2"
          side="left"
        >
          <SheetHeader>
            <SheetTitle>
              <SheetClose asChild>
                <Link href="/dashboard" className="text-3xl font-bold w-auto">
                  Dashboard
                </Link>
              </SheetClose>
            </SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col flex-1 gap-12 items-start justify-start w-full overflow-auto">
            <div className="flex flex-col gap-4 items-start justify-center w-full">
              <h3 className="text-muted-foreground text-lg font-bold">
                Recent Chats
              </h3>
              <ul className="flex flex-col gap-2 w-full">
                {recentChats?.map((chat) => {
                  return (
                    <li key={chat.id}>
                      <SheetClose asChild>
                        <Link
                          href={`/dashboard/chat/${chat.id}`}
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "lg",
                              className:
                                "flex items-center justify-start gap-2 md:gap-4 px-4 md:px-8 text-base font-bold hover:bg-orange-100 truncate",
                            })
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
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-col gap-4 items-start justify-center w-full">
              <h3 className="text-muted-foreground text-lg font-bold">
                Overview
              </h3>
              <ul className="flex flex-col gap-2 w-full">
                {navLinks.map((link, i) => {
                  return (
                    <li key={i + link.href}>
                      <SheetClose asChild>
                        <Link
                          href={link.href}
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "lg",
                              className:
                                "group flex items-center justify-start gap-2 md:gap-4 px-4 md:px-8 text-base font-bold hover:bg-orange-100",
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
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          <SheetFooter>
            <div className="flex gap-2 items-center justify-between py-4 w-full">
              <div className="shrink-0 relative size-12">
                {user?.photoURL && (
                  <Image
                    src={user?.photoURL as string}
                    alt={user?.displayName as string}
                    fill
                    className="rounded-full"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1 flex-1 overflow-hidden *:truncate">
                <h2 className="text-lg font-bold">{user?.displayName}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild className="h-full">
                  <Button variant="ghost" className="h-full">
                    <EllipsisVerticalIcon className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[9999]">
                  <SheetClose asChild>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                  </SheetClose>
                  <SheetClose asChild>
                    <DropdownMenuItem onClick={() => signOut()}>
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Logout"
                      )}
                    </DropdownMenuItem>
                  </SheetClose>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </header>
  );
}
