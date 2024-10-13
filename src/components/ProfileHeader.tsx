"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { useAuthContext } from "./AuthProvider";
import Link from "next/link";
import { formatChatId } from "@/lib/utils";
import { useState } from "react";
import { sendFriendRequest } from "@/actions/firebase-actions/sendFriendRequest";
import { toast } from "sonner";
import { CheckIcon, ChevronDownIcon, Loader2Icon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { removeFriend } from "@/actions/firebase-actions/removeFriend";

type ProfileHeaderProps = {
  isProfile?: boolean;
  user: User | undefined;
  isFriend?: boolean;
};

export default function ProfileHeader({
  isProfile,
  user,
  isFriend,
}: ProfileHeaderProps) {
  const [currentUser] = useAuthContext();

  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [removeLoading, setRemoveLoading] = useState<boolean>(false);

  async function addFriend() {
    if (currentUser && user) {
      try {
        setAddLoading(true);

        await sendFriendRequest(currentUser.uid, user.id);

        toast.success("Friend requset sent");
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      } finally {
        setAddLoading(false);
      }
    }
  }

  async function handleRemoveFriend() {
    if (currentUser && user) {
      try {
        setRemoveLoading(true);

        await removeFriend(currentUser.uid, user.id);

        toast.success("Friend removed");
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      } finally {
        setRemoveLoading(false);
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-4 md:gap-8 w-full px-4">
        <div className="shrink-0 relative size-[5.5rem] md:size-[15.5rem] rounded-full border-2 border-primary">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 md:size-60 rounded-full">
            {user?.photoUrl && (
              <Image
                src={user.photoUrl}
                alt={user.displayName + "image"}
                fill
                className="rounded-full"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-2 overflow-hidden *:truncate">
          <h1 className="text-xl md:text-3xl font-bold">{user?.displayName}</h1>
          <p className="text-lg md:text-xl font-medium text-muted-foreground">
            {user?.email}
          </p>
        </div>

        {!isProfile && (
          <div className="hidden md:flex flex-col items-center gap-2 w-1/4">
            {isFriend ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    className="w-full bg-green-500 dark:bg-green-700 dark:text-foreground"
                  >
                    {removeLoading ? (
                      <Loader2Icon className="size-5 animate-spin" />
                    ) : (
                      <>
                        Friend &nbsp; <ChevronDownIcon className="size-5" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] h-12">
                  <DropdownMenuItem
                    className="h-full"
                    onClick={() => handleRemoveFriend()}
                  >
                    Remove Friend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="icon"
                className="w-full"
                onClick={() => addFriend()}
                disabled={addLoading}
              >
                {addLoading ? (
                  <Loader2Icon className="animate-spin size-5" />
                ) : (
                  "Add Friend"
                )}
              </Button>
            )}

            <Button size="icon" variant="secondary" className="w-full" asChild>
              <Link
                href={`/dashboard/chat/${formatChatId([
                  currentUser?.uid,
                  user?.id,
                ])}`}
              >
                Chat
              </Link>
            </Button>
          </div>
        )}
      </div>

      {!isProfile && (
        <div className="flex md:hidden gap-2 w-full justify-center px-4 *:w-1/2">
          {isFriend ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="bg-green-500 dark:bg-green-700 dark:text-foreground"
                >
                  {removeLoading ? (
                    <Loader2Icon className="size-5 animate-spin" />
                  ) : (
                    <>
                      Friend &nbsp; <ChevronDownIcon className="size-5" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] h-12">
                <DropdownMenuItem
                  className="h-full"
                  onClick={() => handleRemoveFriend()}
                >
                  Remove Friend
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => addFriend()} disabled={addLoading}>
              {addLoading ? (
                <Loader2Icon className="animate-spin size-5" />
              ) : (
                "Add friend"
              )}
            </Button>
          )}

          <Button variant="secondary" asChild>
            <Link
              href={`/dashboard/chat/${formatChatId([
                currentUser?.uid,
                user?.id,
              ])}`}
            >
              Chat
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
