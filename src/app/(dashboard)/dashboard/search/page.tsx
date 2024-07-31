"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserListItem from "@/components/UserListItem";
import { db } from "@/lib/firebase";
import { cn, debounce } from "@/lib/utils";
import {
  collection,
  DocumentData,
  documentId,
  getDocs,
  Query,
  query,
  where,
} from "firebase/firestore";
import { Loader2, XIcon } from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";

export default function SearchPage() {
  const [queryResults, setQueryResults] = useState<User[] | undefined>();
  const [resultsLoading, setResultsLoading] = useState<boolean>(false);

  const searchRef = useRef<HTMLInputElement>(null);

  async function searchBooks(e: ChangeEvent<HTMLInputElement>) {
    setResultsLoading(true);
    setQueryResults([]);
    const searchString = e.target.value;

    if (searchString && searchString.length > 0) {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchString}`
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

  const debouncedSearch = useMemo(() => {
    return debounce(searchBooks, 600);
  }, [searchBooks]);

  return (
    <div className="flex flex-col gap-6 p-4 pt-8 bg-background">
      <div className="flex flex-col w-full gap-4 justify-start">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-lg font-medium">
          Find and Chat with users with books you are looking for
        </p>
      </div>

      <div className="w-full bg-background sticky top-11 lg:top-0 z-40">
        <div className="flex gap-2 w-full lg:w-3/4 xl:w-1/2 py-2">
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search for users"
            onChange={(e) => debouncedSearch(e)}
          />

          <Button
            variant="outline"
            className={cn(!searchRef.current?.value && "invisible")}
            onClick={() => {
              if (searchRef.current?.value) {
                searchRef.current.value = "";
                setQueryResults([]);
              }
            }}
          >
            <XIcon className="size-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        {resultsLoading ? (
          <Loader2 className="size-12 animate-spin text-orange-500" />
        ) : queryResults && queryResults.length > 0 ? (
          queryResults.map((user) => {
            return (
              <UserListItem
                key={user.id}
                user={user}
                actions={<p>actions</p>}
              />
            );
          })
        ) : (
          <p className="text-lg font-medium text-muted-foreground w-full text-center">
            No results
          </p>
        )}
      </div>
    </div>
  );
}
