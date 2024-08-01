"use client";

import { CheckCircleIcon, Loader2Icon, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useAuthContext } from "./AuthProvider";
import { ChangeEvent, useEffect, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {
  arrayUnion,
  collection,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import UserListItem from "./UserListItem";

type UserSearchResultsProps = {
  email: string | undefined;
};

export default function UserSearchResults({ email }: UserSearchResultsProps) {
  const [user] = useAuthContext();
  const [matchingUsers, setMatchingUsers] = useState<User[]>([]);
  const [reqSendLoading, setReqsendLoading] = useState<boolean>(false);

  const [friends] = useDocumentData(
    doc(db, `friends/${user?.uid}`) as DocumentReference<
      { ids: string[] },
      DocumentData
    >
  );

  useEffect(() => {
    async function searchUser(qry: string | undefined) {
      if (qry) {
        try {
          const q = query(
            collection(db, "users"),
            where("email", "==", qry),
            where("email", "!=", user?.email)
          );
          const friend = await getDocs(q);
          const users: User[] = [];
          friend.forEach((frnd) => users.push(frnd.data() as User));
          setMatchingUsers(users);
        } catch (error) {
          console.error(error);
        }
      } else {
        setMatchingUsers([]);
      }
    }

    searchUser(email);
  }, [email]);

  async function sendFriendRequest(requestedUser: User) {
    try {
      setReqsendLoading(true);
      const requestingUserId = user?.uid as string;

      const incomingFr = await getDoc(
        doc(db, `incoming-friend-requests/${requestedUser.id}`)
      );

      if (!incomingFr.exists()) {
        await setDoc(doc(db, `incoming-friend-requests/${requestedUser.id}`), {
          ids: arrayUnion(requestingUserId),
        });
      } else {
        await updateDoc(
          doc(db, `incoming-friend-requests/${requestedUser.id}`),
          {
            ids: arrayUnion(requestingUserId),
          }
        );
      }

      toast.success("Friend Request Sent");
    } catch (error) {
      console.error(error);
      toast.error("Something Went Wrong");
    } finally {
      setReqsendLoading(false);
    }
  }

  return (
    <div className="flex flex-col w-full gap-2 items-center">
      {matchingUsers.length === 0 ? (
        <h1 className="text-lg font-medium text-muted-foreground text-center">
          No Matching Users Found
        </h1>
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
                    isFriend={friends?.ids.includes(user.id) as boolean}
                  />
                }
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}

type AddActionsProps = {
  sendFriendRequest: () => void;
  reqSendLoading: boolean;
  isFriend: boolean;
};

function AddActions({
  sendFriendRequest,
  reqSendLoading,
  isFriend,
}: AddActionsProps) {
  return isFriend ? (
    <div className="flex justify-center items-center size-10 bg-green-200 border border-green-600 rounded-md">
      <CheckCircleIcon className="size-5 text-green-700" />
    </div>
  ) : (
    <Button variant="outline" size="icon" onClick={() => sendFriendRequest()}>
      {reqSendLoading ? (
        <Loader2Icon className="h-5 w-5 animate-spin" />
      ) : (
        <Plus className="h-5 w-5" />
      )}
    </Button>
  );
}
