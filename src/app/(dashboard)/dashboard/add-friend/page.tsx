"use client";

import { useAuthContext } from "@/components/AuthProvider";
import UserListItem from "@/components/UserListItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { cn, debounce } from "@/lib/utils";
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
import { CheckCircleIcon, Loader2Icon, Plus, XIcon } from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { toast } from "sonner";

type AddActionsProps = {
  sendFriendRequest: () => void;
  reqSendLoading: boolean;
  isFriend: boolean;
};

export default function AddFriendPage() {
  const [user] = useAuthContext();
  const [matchingUsers, setMatchingUsers] = useState<User[]>([]);
  const [reqSendLoading, setReqsendLoading] = useState<boolean>(false);

  const userEmailRef = useRef<HTMLInputElement>(null);

  const [friends] = useDocumentData(
    doc(db, `friends/${user?.uid}`) as DocumentReference<
      { ids: string[] },
      DocumentData
    >
  );

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

  const debouncedUserSearch = useMemo(() => {
    return debounce(searchUser, 600);
  }, [searchUser]);

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
    <div className="flex flex-col w-full gap-10 pt-8 px-4">
      <div className="flex flex-col gap-4 w-full">
        <h1 className="text-3xl font-bold">Add friend</h1>

        <div className="flex gap-2 w-full lg:w-3/4 xl:w-1/2 py-2">
          <Input
            ref={userEmailRef}
            type="email"
            placeholder="you@gmail.com"
            onChange={(e) => debouncedUserSearch(e)}
          />

          <Button
            variant="outline"
            className={cn(!userEmailRef.current?.value && "invisible")}
            onClick={() => {
              if (userEmailRef.current?.value) {
                userEmailRef.current.value = "";
                setMatchingUsers([]);
              }
            }}
          >
            <XIcon className="size-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col w-full gap-2 items-center">
        {matchingUsers.length === 0 ? (
          <h1 className="text-xl font-bold text-center">
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
    </div>
  );
}

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
