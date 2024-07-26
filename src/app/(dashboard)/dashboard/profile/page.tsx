"use client";

import ErrorComp from "@/components/ErrorComp";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentReference,
} from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection, useDocumentData } from "react-firebase-hooks/firestore";
import ProfileLoading from "./loading";
import Link from "next/link";
import AddBookButton from "@/components/AddBookButton";

export default function ProfilePage() {
  const [user] = useAuthState(auth);
  const [dbUser, dbUserLoading, dbUserError] = useDocumentData(
    doc(db, `users/${user?.uid}`) as DocumentReference<User, DocumentData>
  );
  const [userBooks, booksLoading] = useCollection(
    collection(
      db,
      `shared-books/${user?.uid}/book-details`
    ) as CollectionReference<Omit<SharedBook, "bookDocId">, DocumentData>
  );
  const [sharedBooks, setSharedBooks] = useState<SharedBook[] | undefined>();

  useEffect(() => {
    async function getSharedBooks() {
      if (user && userBooks && userBooks.size > 0) {
        try {
          const sharedBook: SharedBook[] = [];
          userBooks.forEach((book) => {
            sharedBook.push({ bookDocId: book.id, ...book.data() });
          });

          setSharedBooks(sharedBook);
        } catch (error) {
          console.log(error);
        }
      }
    }

    getSharedBooks();
  }, [user, userBooks]);

  if (dbUserLoading) {
    return <ProfileLoading />;
  }

  if (dbUserError) {
    return <ErrorComp />;
  }

  return (
    <div className="flex flex-col gap-10 items-center py-4 md:py-8">
      <div className="flex items-center gap-4 md:gap-8 w-full px-4">
        <div className="relative size-20 md:size-60">
          {dbUser?.photoUrl && (
            <Image
              src={dbUser.photoUrl}
              alt={dbUser.displayName + "image"}
              fill
              className="rounded-full"
            />
          )}
        </div>
        <div className="flex flex-col flex-1 gap-2">
          <h1 className="text-xl md:text-3xl font-bold">
            {dbUser?.displayName}
          </h1>
          <p className="text-lg md:text-xl font-medium text-muted-foreground">
            {dbUser?.email}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-lg md:text-xl font-medium text-center md:text-start w-full px-4">
          Your books that are up for sharing
        </h2>

        <div className="grid grid-cols-3 xl:grid-cols-5 w-full gap-[2px] md:px-4">
          <AddBookButton user={user} />

          {sharedBooks &&
            sharedBooks.map((book) => {
              return (
                <Link
                  key={book.bookId}
                  href={`/dashboard/profile/shared-books/${book.bookDocId}`}
                  className="group relative w-full h-32 md:h-[20vw] lg:h-[15vw] cursor-pointer"
                >
                  <Image
                    src={book.bookImageUrl}
                    alt={`${book.bookName} image`}
                    fill
                    className="object-cover group-hover:opacity-85 transition-opacity"
                  />
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
