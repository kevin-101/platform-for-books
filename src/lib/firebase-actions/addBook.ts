"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDB } from "../firebase-admin";
import { revalidatePath } from "next/cache";

export async function addBook(
  selectedBook: { bookId: string; bookName: string },
  user: User,
  uploadedImageUrl: string
) {
  if (!adminDB) {
    throw new Error("Cannot connect to database");
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
