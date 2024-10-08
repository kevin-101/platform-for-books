"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { User as AuthUser } from "firebase/auth";
import { CheckIcon, Loader2Icon, X } from "lucide-react";
import UserListItem from "./UserListItem";

type FriendRequestsProps = {
  requests: User[] | undefined;
  user: AuthUser | null | undefined;
};

export default function FriendRequests({
  requests,
  user,
}: FriendRequestsProps) {
  async function denyRequest(idToDelete: string) {
    await updateDoc(doc(db, `incoming-friend-requests/${user?.uid}`), {
      ids: arrayRemove(idToDelete),
    });
  }

  async function acceptRequest(friendId: string) {
    const userFriends = await getDoc(doc(db, `friends/${user?.uid}`));
    const otherUserFriends = await getDoc(doc(db, `friends/${friendId}`));

    // add friends mutually and delete incoming request
    if (!userFriends.exists()) {
      await setDoc(doc(db, `friends/${user?.uid}`), {
        ids: arrayUnion(friendId),
      });
    } else {
      await updateDoc(doc(db, `friends/${user?.uid}`), {
        ids: arrayUnion(friendId),
      });
    }

    if (!otherUserFriends.exists()) {
      await setDoc(doc(db, `friends/${friendId}`), {
        ids: arrayUnion(user?.uid),
      });
    } else {
      await updateDoc(doc(db, `friends/${friendId}`), {
        ids: arrayUnion(user?.uid),
      });
    }

    await updateDoc(doc(db, `incoming-friend-requests/${user?.uid}`), {
      ids: arrayRemove(friendId),
    });
  }

  return (
    <ul className="flex flex-col gap-4 w-full">
      {requests?.map((request, _) => {
        return (
          <UserListItem
            key={request.id}
            user={request}
            actions={
              <ReqActions
                denyRequest={() => denyRequest(request.id)}
                acceptRequest={() => acceptRequest(request.id)}
              />
            }
          />
        );
      })}
    </ul>
  );
}

type ReqActionsProps = {
  denyRequest: () => Promise<void>;
  acceptRequest: () => Promise<void>;
};

function ReqActions({ denyRequest, acceptRequest }: ReqActionsProps) {
  const [denyLoading, setDenyLoading] = useState<boolean>(false);
  const [acceptLoading, setAcceptLoading] = useState<boolean>(false);

  async function deny() {
    try {
      setDenyLoading(true);

      await denyRequest();

      toast.success("Friend request denied");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Try again");
    } finally {
      setDenyLoading(false);
    }
  }

  async function accept() {
    try {
      setAcceptLoading(true);

      await acceptRequest();

      toast.success("Friend added");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again");
    } finally {
      setAcceptLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={() => deny()}>
        {denyLoading ? (
          <Loader2Icon className="h-5 w-5 animate-spin" />
        ) : (
          <X className="h-5 w-5" />
        )}
      </Button>

      <Button variant="outline" size="icon" onClick={() => accept()}>
        {acceptLoading ? (
          <Loader2Icon className="h-5 w-5 animate-spin" />
        ) : (
          <CheckIcon className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
