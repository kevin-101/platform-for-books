"use client";

import Image from "next/image";
import { useAuthContext } from "./AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { EllipsisVerticalIcon, Loader2 } from "lucide-react";
import { SheetClose } from "./ui/sheet";
import Link from "next/link";
import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Skeleton } from "./ui/skeleton";

export default function NavFooter({ inSheet }: { inSheet?: boolean }) {
  const [user, userLoading] = useAuthContext();

  const [signOut, loading] = useSignOut(auth);

  return (
    <div className="flex gap-2 items-center justify-between py-4 w-full">
      {userLoading ? (
        <>
          <Skeleton className="shrink-0 relative size-[3.5rem] rounded-full" />

          <div className="flex flex-col gap-1 flex-1">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </>
      ) : (
        <>
          <div className="shrink-0 relative size-[3.5rem] rounded-full border-2 border-primary">
            {user?.photoURL && (
              <div className="absolute size-12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Image
                  src={user?.photoURL as string}
                  alt={user?.displayName as string}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 flex-1 overflow-hidden *:truncate">
            <h2 className="text-lg font-bold">{user?.displayName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild className="h-full">
          <Button variant="ghost" className="h-full">
            <EllipsisVerticalIcon className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-[9999]">
          {inSheet ? (
            <SheetClose asChild>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
            </SheetClose>
          ) : (
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
          )}

          {inSheet ? (
            <SheetClose asChild>
              <DropdownMenuItem onClick={() => signOut()}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Logout"
                )}
              </DropdownMenuItem>
            </SheetClose>
          ) : (
            <DropdownMenuItem onClick={() => signOut()}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Logout"
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
