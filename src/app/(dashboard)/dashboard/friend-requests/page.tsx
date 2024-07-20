"use client";

import ErrorComp from "@/components/ErrorComp";
import FriendRequests from "@/components/FriendRequests";
import LoadingComp from "@/components/LoadingComp";
import { auth, db } from "@/lib/firebase";
import {
  DocumentData,
  DocumentReference,
  Query,
  collection,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";

export default function FriendRequestsPage() {
  const [user] = useAuthState(auth);
  const reqRef = doc(
    db,
    `incoming-friend-requests/${user?.uid}`
  ) as DocumentReference<{ ids: string[] }, DocumentData>;
  const [friendRequestsIds, loading, error] = useDocumentData(reqRef);
  const [friendRequests, setFriendRequests] = useState<User[] | undefined>([]);

  useEffect(() => {
    async function getRequests() {
      if (friendRequestsIds && friendRequestsIds.ids.length > 0) {
        try {
          const reqSnapshot = await getDocs(
            query(
              collection(db, `users`),
              where("id", "in", friendRequestsIds.ids)
            ) as Query<User, DocumentData>
          );

          const frndReqs: User[] = [];

          reqSnapshot.forEach((req) => {
            frndReqs.push(req.data());
          });

          setFriendRequests(frndReqs);
        } catch (error) {
          console.log(error);
        }
      } else {
        setFriendRequests([]);
      }
    }

    getRequests();
  }, [friendRequestsIds]);

  if (error) {
    return <ErrorComp />;
  }

  if (loading) {
    return <LoadingComp />;
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full p-4 pt-8">
      <div className="flex w-full justify-start">
        <h1 className="text-3xl font-bold">Friend Requests</h1>
      </div>
      {friendRequests?.length === 0 ? (
        <h2 className="text-xl font-bold">No friend requests</h2>
      ) : (
        <FriendRequests requests={friendRequests} user={user} />
      )}
    </div>
  );
}
