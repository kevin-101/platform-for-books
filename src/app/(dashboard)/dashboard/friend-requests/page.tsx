"use client";

import ErrorComp from "@/components/ErrorComp";
import FriendRequests from "@/components/FriendRequests";
import LoadingComp from "@/components/LoadingComp";
import { auth, db } from "@/lib/firebase";
import {
  CollectionReference,
  DocumentData,
  collection,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

export default function FriendRequestsPage() {
  const [user] = useAuthState(auth);
  const reqRef = collection(
    db,
    `user:${user?.uid}:incoming-friend-requests`
  ) as CollectionReference<User, DocumentData>;
  const [friendRequests, loading, error] = useCollectionData<User>(reqRef);

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
