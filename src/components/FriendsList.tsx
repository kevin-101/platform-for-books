"use client";

import { Button } from "./ui/button";
import { EllipsisVerticalIcon, MessageCircleIcon, XIcon } from "lucide-react";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LoadingComp from "./LoadingComp";
import UserListItem from "./UserListItem";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { cn, formatChatId } from "@/lib/utils";
import { User as AuthUser } from "firebase/auth";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { useAuthContext } from "./AuthProvider";

type FriendsListProps = {
  friends: User[] | undefined;
};

type FriendsListActionsProps = {
  friend: User;
  user: AuthUser | null | undefined;
  removeFn: () => void;
};

export default function FriendsList({ friends }: FriendsListProps) {
  const [user] = useAuthContext();

  const [searchText, setSearchText] = useState<string>("");

  async function removeFriend(friendId: string) {
    if (user) {
      try {
        await updateDoc(doc(db, `friends/${user.uid}`), {
          ids: arrayRemove(friendId),
        });
        toast.success("Friend removed");
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong. Try again");
      }
    }
  }

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
                  actions={
                    <FriendsListActions
                      friend={friend}
                      user={user}
                      removeFn={() => removeFriend(friend.id)}
                    />
                  }
                />
              );
            })}
        </ul>
      ) : (
        <h1 className="text-xl font-bold">No friends</h1>
      )}
    </div>
  );
}

function FriendsListActions({
  friend,
  user,
  removeFn,
}: FriendsListActionsProps) {
  return (
    <div className="flex gap-2 md:gap-4 items-center">
      <Button asChild size="icon">
        <Link href={`/dashboard/chat/${formatChatId([friend.id, user?.uid])}`}>
          <MessageCircleIcon className="size-5" />
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-medium">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/user/${friend.id}`}>Profile</Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => removeFn()}>
            Remove friend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
