"use client";

import { Button } from "./ui/button";
import { EllipsisVerticalIcon, MessageCircleIcon } from "lucide-react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
  DocumentData,
  Query,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import LoadingComp from "./LoadingComp";
import ErrorComp from "./ErrorComp";
import UserListItem from "./UserListItem";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { formatChatId } from "@/lib/utils";
import { User as AuthUser } from "firebase/auth";
import { toast } from "sonner";

type FriendsListProps = {};

type FriendsListActionsProps = {
  friend: User;
  user: AuthUser | null | undefined;
  removeFn: () => void;
};

export default function FriendsList({}: FriendsListProps) {
  const [user] = useAuthState(auth);
  const [value, loading, error] = useCollectionData(
    collection(db, `user:${user?.uid}:friends`)
  );
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    async function getFriends() {
      if (value?.length !== 0 || value === undefined) {
        const friendIds: string[] = [];
        value?.forEach((friend) => friendIds.push(friend.id));

        try {
          const friendsSnapshot = await getDocs(
            query(
              collection(db, "users"),
              where("id", "in", friendIds)
            ) as Query<User, DocumentData>
          );

          const frnds: User[] = [];
          friendsSnapshot.forEach((frnd) => frnds.push(frnd.data()));
          setFriends(frnds);
        } catch (error) {
          console.log(error);
        }
      } else {
        setFriends([]);
      }
    }

    getFriends();
  }, [value]);

  async function removeFriend(friendId: string) {
    try {
      await deleteDoc(doc(db, `user:${user?.uid}:friends/${friendId}`));
      toast.success("Friend removed");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again");
    }
  }

  if (error) {
    return <ErrorComp />;
  }

  if (loading) {
    return <LoadingComp />;
  }

  return friends.length === 0 ? (
    <h1 className="text-xl font-bold">No friends lol</h1>
  ) : (
    <ul className="flex flex-col gap-4 w-full">
      {friends?.map((friend, _) => {
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
  );
}

function FriendsListActions({
  friend,
  user,
  removeFn,
}: FriendsListActionsProps) {
  return (
    <div className="flex gap-4 items-center">
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
