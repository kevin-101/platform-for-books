"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  arrayRemove,
  arrayUnion,
  doc,
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

type ReqActionsProps = {
  denyRequest: () => void;
  acceptRequest: () => void;
  denyLoading: boolean;
  acceptLoading: boolean;
};

export default function FriendRequests({
  requests,
  user,
}: FriendRequestsProps) {
  const [denyLoading, setDenyLoading] = useState<boolean>(false);
  const [acceptLoading, setAcceptLoading] = useState<boolean>(false);

  async function denyRequest(idToDelete: string) {
    try {
      setDenyLoading(true);
      await updateDoc(doc(db, `incoming-friend-requests/${user?.uid}`), {
        ids: arrayRemove(idToDelete),
      });
      toast.success("Friend request denied");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Try again");
    } finally {
      setDenyLoading(false);
    }
  }

  async function acceptRequest(friendId: string) {
    try {
      setAcceptLoading(true);

      // add friends mutually and delete incoming request
      await setDoc(doc(db, `friends/${user?.uid}`), {
        ids: arrayUnion(friendId),
      });
      await setDoc(doc(db, `friends/${friendId}`), {
        ids: arrayUnion(user?.uid),
      });
      await updateDoc(doc(db, `incoming-friend-requests/${user?.uid}`), {
        ids: arrayRemove(friendId),
      });

      toast.success("Friend added");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again");
    } finally {
      setAcceptLoading(false);
    }
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
                denyLoading={denyLoading}
                acceptLoading={acceptLoading}
              />
            }
          />
        );
      })}
    </ul>
  );
}

function ReqActions({
  denyRequest,
  acceptRequest,
  denyLoading,
  acceptLoading,
}: ReqActionsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={() => denyRequest()}>
        {denyLoading ? (
          <Loader2Icon className="h-5 w-5 animate-spin" />
        ) : (
          <X className="h-5 w-5" />
        )}
      </Button>

      <Button variant="outline" size="icon" onClick={() => acceptRequest()}>
        {acceptLoading ? (
          <Loader2Icon className="h-5 w-5 animate-spin" />
        ) : (
          <CheckIcon className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
