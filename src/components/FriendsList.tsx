"use client";

import { Button } from "./ui/button";
import { EllipsisVerticalIcon } from "lucide-react";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import {
  DocumentData,
  Query,
  collection,
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

type FriendsListProps = {};

type FriendsListActionsProps = {
  friend: User;
  user: AuthUser | null | undefined;
};

export default function FriendsList({}: FriendsListProps) {
  const [user] = useAuthState(auth);
  const [value, loading, error] = useCollectionDataOnce(
    collection(db, `user:${user?.uid}:friends`)
  );
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    async function getFriends() {
      if (value) {
        const friendIds: string[] = [];
        value?.forEach((friend) => friendIds.push(friend.id));

        const friendsSnapshot = await getDocs(
          query(collection(db, "users"), where("id", "in", friendIds)) as Query<
            User,
            DocumentData
          >
        );

        const frnds: User[] = [];
        friendsSnapshot.forEach((frnd) => frnds.push(frnd.data()));
        setFriends(frnds);
      }
    }

    getFriends();
  }, [value]);

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
            actions={<FriendsListActions friend={friend} user={user} />}
          />
        );
      })}
    </ul>
  );
}

function FriendsListActions({ friend, user }: FriendsListActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVerticalIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="font-medium">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/user/${friend.id}`}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/chat/${formatChatId([friend.id, user!.uid])}`}
          >
            Chat
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Remove friend</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
