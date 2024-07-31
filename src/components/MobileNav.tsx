"use client";

import { ClassValue } from "clsx";

import { HomeIcon, MenuIcon, MessageCircle, SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
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
import { useParams, usePathname } from "next/navigation";
import NavLinks, { LinkType } from "./NavLinks";
import NavFooter from "./NavFooter";

type MobileNavProps = {
  className?: ClassValue;
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

export default function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const { chatId } = useParams<{ chatId: string }>();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex lg:hidden w-full justify-end px-2 py-1 border-b border-orange-200 bg-orange-50",
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
              {/* {friendRequests && friendRequests.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-600 rounded-full" />
              )} */}
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

          <nav className="flex flex-col flex-1 gap-4 items-start justify-start w-full overflow-auto">
            <NavLinks inSheet />
          </nav>

          <SheetFooter>
            <NavFooter inSheet />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </header>
  );
}
