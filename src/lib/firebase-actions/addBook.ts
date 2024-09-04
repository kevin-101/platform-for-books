"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDB } from "../firebase-admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function addBook(
  selectedBook: { bookId: string; bookName: string },
  user: User,
  uploadedImageUrl: string
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

  const sharedBook = await adminDB.collection(`shared-books`).add({
    bookId: selectedBook.bookId,
    bookName: selectedBook.bookName,
    userId: user.id,
    bookImageUrl: uploadedImageUrl,
  });

  const userBooks = await adminDB
    .collection(`user-shared-books`)
    .doc(user.id)
    .get();

  if (!userBooks.exists) {
    await adminDB
      .collection(`user-shared-books`)
      .doc(user.id)
      .set({ bookIds: FieldValue.arrayUnion(sharedBook.id) });

    revalidatePath("/dashboard/profile");

    return;
  }

  await adminDB
    .collection(`user-shared-books`)
    .doc(user.id)
    .update({
      bookIds: FieldValue.arrayUnion(sharedBook.id),
    });

  revalidatePath("/dashboard/profile");
}
