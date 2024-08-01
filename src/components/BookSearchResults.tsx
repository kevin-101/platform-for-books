"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  DocumentData,
  documentId,
  getDocs,
  Query,
  query,
  where,
} from "firebase/firestore";
import { Loader2, MessageCircleIcon, User, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import UserListItem from "./UserListItem";
import { Button } from "./ui/button";
import { formatChatId } from "@/lib/utils";
import { useAuthContext } from "./AuthProvider";
import Link from "next/link";

type BookSearchResultsProps = {
  searchTerm: string | undefined;
};

export default function BookSearchResults({
  searchTerm,
}: BookSearchResultsProps) {
  const [user] = useAuthContext();
  const [queryResults, setQueryResults] = useState<User[] | undefined>();
  const [resultsLoading, setResultsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function searchBooks(term: string | undefined) {
      setResultsLoading(true);
      setQueryResults([]);

      if (term) {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${term}`
        );
        const data = await response.json();
        const books = data.items as Book[];

        const queryBookIds: string[] = [];
        books.forEach((book) => queryBookIds.push(book.id));

        if (queryBookIds && queryBookIds.length > 0) {
          const sharedUserIds: string[] = [];

          const bookSnaphot = await getDocs(
            query(
              collection(db, `all-shared-books`),
              where(documentId(), "in", queryBookIds)
            ) as Query<Omit<AllSharedBook, "bookId">, DocumentData>
          );
          bookSnaphot.forEach((book) => {
            sharedUserIds.push(...book.data().userIds);
          });

          if (sharedUserIds && sharedUserIds.length > 0) {
            const booksSharedUsers: User[] = [];

            const sharedUsersSnapshot = await getDocs(
              query(
                collection(db, `users`),
                where(documentId(), "in", sharedUserIds)
              ) as Query<User, DocumentData>
            );
            sharedUsersSnapshot.forEach((user) => {
              booksSharedUsers.push({ ...user.data() });
            });

            setQueryResults(booksSharedUsers);
          }
        }
        setResultsLoading(false);
      } else {
        setQueryResults([]);
        setResultsLoading(false);
      }
    }

    searchBooks(searchTerm);
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {resultsLoading ? (
        <Loader2 className="size-12 animate-spin text-orange-500" />
      ) : queryResults && queryResults.length > 0 ? (
        queryResults.map((friend) => {
          return (
            <UserListItem
              key={friend.id}
              user={friend}
              actions={<Actions friendId={friend.id} userId={user?.uid} />}
            />
          );
        })
      ) : (
        <p className="text-lg font-medium text-muted-foreground w-full text-center">
          No results
        </p>
      )}
    </div>
  );
}

type ActionsProps = {
  friendId: string | undefined;
  userId: string | undefined;
};

function Actions({ friendId, userId }: ActionsProps) {
  return (
    <div className="flex gap-2 md:gap-4">
      <Button size="icon" asChild>
        {/* <Link href={`/dashboard/chat/${formatChatId([userId, friendId])}`}> */}
        <MessageCircleIcon className="size-5" />
        {/* </Link> */}
      </Button>

      <Button variant="outline" size="icon">
        <UserIcon className="size-5" />
      </Button>
    </div>
  );
}
