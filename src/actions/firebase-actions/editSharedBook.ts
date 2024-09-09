"use server";

import { adminAuth, adminDB } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function editSharedBook(
  bookId: string,
  userId: string,
  newBookId: string,
  bookName: string,
  bookImageUrl?: string
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

  if (bookImageUrl) {
    await adminDB.collection("shared-books").doc(bookId).update({
      bookId: newBookId,
      bookName: bookName,
      bookImageUrl: bookImageUrl,
    });
  }

  await adminDB.collection("shared-books").doc(bookId).update({
    bookName: bookName,
  });

  revalidatePath(`/dashboard/profile`);
  revalidatePath(`/dashboard/user/${userId}`);
  revalidatePath(`/dashboard/shared-books/${bookId}`);
}
