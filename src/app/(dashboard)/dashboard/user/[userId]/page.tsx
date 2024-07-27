"use client";

import ProfileHeader from "@/components/ProfileHeader";
import { db } from "@/lib/firebase";
import {
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentReference,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useCollectionOnce,
  useDocumentDataOnce,
} from "react-firebase-hooks/firestore";
import ProfileLoading from "../../profile/loading";
import { Skeleton } from "@/components/ui/skeleton";

type UserProfilePageProps = {
  params: {
    userId: string;
  };
};

export default function UserProfilePage({
  params: { userId },
}: UserProfilePageProps) {
  const [dbUser, userLoading] = useDocumentDataOnce(
    doc(db, `users/${userId}`) as DocumentReference<User, DocumentData>
  );
  const [booksSnapshot, booksLoading] = useCollectionOnce(
    collection(
      db,
      `shared-books/${userId}/book-details`
    ) as CollectionReference<Omit<SharedBook, "bookDocId">, DocumentData>
  );

  const [sharedBooks, setSharedBooks] = useState<SharedBook[] | undefined>();

  useEffect(() => {
    function getSharedBooks() {
      const books: SharedBook[] = [];

      booksSnapshot?.forEach((bk) =>
        books.push({ bookDocId: bk.id, ...bk.data() })
      );

      setSharedBooks(books);
    }

    getSharedBooks();
  }, [dbUser, booksSnapshot]);

  if (userLoading) {
    return <ProfileLoading booksGridHeading="Shared books" />;
  }

  return (
    <div className="flex flex-col gap-10 md:px-4 py-4 md:py-8">
      <ProfileHeader user={dbUser} />

      <div className="flex flex-col w-full gap-4">
        <h2 className="text-lg md:text-xl font-medium text-center md:text-start">
          Shared books
        </h2>

        <div className="grid grid-cols-3 xl:grid-cols-5 w-full gap-[2px]">
          {booksLoading
            ? [...Array(7)].map(() => {
                return <Skeleton className="aspect-square rounded-none" />;
              })
            : sharedBooks?.map((book) => {
                return (
                  <Link
                    key={book.bookDocId}
                    href={`/dashboard/book/${book.bookDocId}`}
                    className="group relative aspect-square cursor-pointer"
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
