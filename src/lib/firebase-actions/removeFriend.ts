"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDB } from "../firebase-admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function removeFriend(userId: string, friendId: string) {
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

  await adminDB
    .collection("friends")
    .doc(userId)
    .update({
      ids: FieldValue.arrayRemove(friendId),
    });

  revalidatePath("/dashboard/friends");
}
