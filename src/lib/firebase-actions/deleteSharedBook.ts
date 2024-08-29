"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDB } from "../firebase-admin";
import { revalidatePath } from "next/cache";

export async function deleteSharedBook(bookId: string, userId: string) {
  if (!adminDB) {
    throw new Error("Cannot connect to database");
  }

  await adminDB.collection("shared-books").doc(bookId).delete();

  await adminDB
    .collection("user-shared-books")
    .doc(userId)
    .update({
      bookIds: FieldValue.arrayRemove(bookId),
    });

  revalidatePath(`/dashboard/profile`);
  revalidatePath(`/dashboard/user/${userId}`);
}
