"use client";

import { Button } from "./ui/button";
import {
  Loader2Icon,
  MehIcon,
  MessageCircleIcon,
  UserMinus,
  XIcon,
} from "lucide-react";
import UserListItem from "./UserListItem";
import { useState } from "react";
import Link from "next/link";
import { cn, formatChatId } from "@/lib/utils";
import { User as AuthUser } from "firebase/auth";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { useAuthContext } from "./AuthProvider";
import { removeFriend } from "@/actions/firebase-actions/removeFriend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

type FriendsListProps = {
  friends: User[] | undefined;
};

export default function FriendsList({ friends }: FriendsListProps) {
  const [user] = useAuthContext();

  const [searchText, setSearchText] = useState<string>("");

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="w-full bg-background sticky top-11 lg:top-0 z-40">
        <div className="w-full lg:w-3/4 xl:w-1/2 py-2 flex gap-2">
          <Input
            type="text"
            value={searchText}
            placeholder="Search friends"
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Button
            variant="outline"
            className={cn({ invisible: !searchText })}
            onClick={() => setSearchText("")}
          >
            <XIcon className="size-5" />
          </Button>
        </div>
      </div>

      {friends && friends.length > 0 ? (
        <ul className="flex flex-col gap-4 w-full">
          {friends
            .filter((friend) =>
              friend.displayName
                .toLowerCase()
                .includes(searchText.toLowerCase())
            )
            .map((friend, _) => {
              return (
                <UserListItem
                  key={friend.id}
                  user={friend}
                  actions={<FriendsListActions friend={friend} user={user} />}
                />
              );
            })}
        </ul>
      ) : (
        <div className="flex flex-col gap-4 w-full items-center">
          <MehIcon className="size-24 md:size-36 stroke-1" />
          <h1 className="text-xl text-center font-bold">No friends</h1>
        </div>
      )}
    </div>
  );
}

type FriendsListActionsProps = {
  friend: User;
  user: AuthUser | null | undefined;
};

function FriendsListActions({ friend, user }: FriendsListActionsProps) {
  const [removeLoading, setRemoveLoading] = useState<boolean>(false);

  async function handleRemoveFriend() {
    if (user) {
      try {
        setRemoveLoading(true);

        await removeFriend(user.uid, friend.id);

        toast.success("Friend removed");
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong. Try again");
      } finally {
        setRemoveLoading(false);
      }
    }
  }

  return (
    <div className="flex gap-2 md:gap-4 items-center">
      <Button asChild size="icon">
        <Link href={`/dashboard/chat/${formatChatId([friend.id, user?.uid])}`}>
          <MessageCircleIcon className="size-5" />
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" disabled={removeLoading}>
            {removeLoading ? (
              <Loader2Icon className="animate-spin size-5" />
            ) : (
              <UserMinus className="size-5" />
            )}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm remove</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              user form your friends list.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRemoveFriend()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
