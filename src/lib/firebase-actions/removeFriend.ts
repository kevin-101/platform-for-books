"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDB } from "../firebase-admin";
import { revalidatePath } from "next/cache";

export async function removeFriend(userId: string, friendId: string) {
  if (!adminDB) {
    throw new Error("Cannot connect to database");
  }

  await adminDB
    .collection("friends")
    .doc(userId)
    .update({
      ids: FieldValue.arrayRemove(friendId),
    });

  revalidatePath("/dashboard/friends");
}
