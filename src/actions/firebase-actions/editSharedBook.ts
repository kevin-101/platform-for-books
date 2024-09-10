"use server";

import { adminAuth, adminDB } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function editSharedBook(
  bookId: string,
  userId: string,
  newBook?: { bookId: string; bookName: string },
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

  if (!bookImageUrl && !newBook) {
    throw new Error("New book nor book image url not provided");
  }

  if (bookImageUrl && newBook) {
    await adminDB.collection("shared-books").doc(bookId).update({
      bookId: newBook.bookId,
      bookName: newBook.bookName,
      bookImageUrl: bookImageUrl,
      timestamp: FieldValue.serverTimestamp(),
    });
  }

  if (bookImageUrl) {
    await adminDB.collection("shared-books").doc(bookId).update({
      bookImageUrl: bookImageUrl,
      timestamp: FieldValue.serverTimestamp(),
    });
  }

  if (newBook) {
    await adminDB.collection("shared-books").doc(bookId).update({
      bookId: newBook.bookId,
      bookName: newBook.bookName,
      timestamp: FieldValue.serverTimestamp(),
    });
  }

  revalidatePath(`/dashboard/profile`);
  revalidatePath(`/dashboard/user/${userId}`);
  revalidatePath(`/dashboard/shared-books/${bookId}`);
}
