"use client";

import UserListItem from "@/components/UserListItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { Loader2Icon, Plus } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";

type AddActionsProps = {
  sendFriendRequest: () => void;
  reqSendLoading: boolean;
};

export default function AddFriendPage() {
  const [user] = useAuthState(auth);
  const [matchingUsers, setMatchingUsers] = useState<User[]>([]);
  const [reqSendLoading, setReqsendLoading] = useState<boolean>(false);

  async function searchUser(e: ChangeEvent<HTMLInputElement>) {
    const email = e.target.value;
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", email),
        where("email", "!=", user?.email)
      );
      const friend = await getDocs(q);
      const users: User[] = [];
      friend.forEach((frnd) => users.push(frnd.data() as User));
      setMatchingUsers(users);
    } catch (error) {
      console.error(error);
    }
  }

  async function sendFriendRequest(requestedUser: User) {
    try {
      setReqsendLoading(true);
      const requestingUserId = user?.uid as string;
      await setDoc(
        doc(
          db,
          `user:${requestedUser.id}:incoming-friend-requests/${requestingUserId}`
        ),
        {
          id: requestingUserId,
          displayName: user?.displayName,
          email: user?.email,
          photoUrl: user?.photoURL,
        }
      );
      toast.success("Friend Request Sent");
    } catch (error) {
      console.error(error);
      toast.error("Something Went Wrong");
    } finally {
      setReqsendLoading(false);
    }
  }

  return (
    <div className="flex flex-col w-full gap-10 pt-8 px-4">
      <div className="flex flex-col gap-4 w-full lg:w-1/2">
        <h1 className="text-3xl font-bold">Add friend</h1>
        <Input
          type="email"
          placeholder="you@gmail.com"
          onChange={(e) => searchUser(e)}
        />
      </div>

      <div className="flex flex-col w-full gap-2 items-center">
        {matchingUsers.length === 0 ? (
          <h1 className="text-3xl font-bold">No Matching Users Found</h1>
        ) : (
          <ul className="flex flex-col w-full gap-2">
            {matchingUsers.map((user, _) => {
              return (
                <UserListItem
                  key={user.id}
                  user={user}
                  actions={
                    <AddActions
                      sendFriendRequest={() => sendFriendRequest(user)}
                      reqSendLoading={reqSendLoading}
                    />
                  }
                />
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function AddActions({ sendFriendRequest, reqSendLoading }: AddActionsProps) {
  return (
    <Button variant="outline" size="icon" onClick={() => sendFriendRequest()}>
      {reqSendLoading ? (
        <Loader2Icon className="h-5 w-5 animate-spin" />
      ) : (
        <Plus className="h-5 w-5" />
      )}
    </Button>
  );
}
