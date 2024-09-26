"use server";

import { adminAuth, adminDB } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export async function sendFriendRequest(
  requestingUserId: string,
  requestedUserId: string
) {
  if (!adminDB) {
    throw new Error("Cannot connect to database");
  }

  if (!adminAuth) {
    throw new Error("Cannot connect to auth database");
  }

  const idToken = cookies().get("idToken")?.value;
  const decodedToken = idToken && (await adminAuth.verifyIdToken(idToken));

  if (!decodedToken) {
    throw new Error("Unauthorized");
  }

  const incomingFr = await adminDB
    .doc(`incoming-friend-requsets/${requestedUserId}`)
    .get();

  if (!incomingFr.exists) {
    await adminDB.doc(`incoming-friend-requests/${requestedUserId}`).set({
      ids: FieldValue.arrayUnion(requestingUserId),
    });

    return;
  }

  await adminDB.doc(`incoming-friend-requests/${requestedUserId}`).update({
    ids: FieldValue.arrayUnion(requestingUserId),
  });
}
