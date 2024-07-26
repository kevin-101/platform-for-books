"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";

export default function SearchPage() {
  const [queryResults, setQueryResults] = useState<Book[] | undefined>();

  const searchRef = useRef<HTMLInputElement>(null);

  async function searchBooks(e: ChangeEvent<HTMLInputElement>) {
    const searchString = e.target.value;

    if (searchString && searchString.length > 0) {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchString}`
      );
      const data = await response.json();
      const books = data.items as Book[];

      const queryBooks: string[] = [];
      books.forEach((book) => queryBooks.push(book.volumeInfo.title));

      setQueryResults(data.items);
    } else {
      setQueryResults([]);
    }
  }

  return (
    <div className="flex flex-col gap-10 p-4 pt-8">
      <div className="flex flex-col w-full lg:w-3/4 xl:w-1/2 gap-4 justify-start">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-lg font-medium">
          Find and Chat with users with books you are looking for
        </p>

        <div className="flex gap-2 w-full">
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search for users"
            onChange={(e) => searchBooks(e)}
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

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 w-full items-center">
        {queryResults?.map((book) => {
          return (
            <div
              key={book.id}
              className="flex flex-col gap-2 w-full min-h-full items-center px-2 py-4 border border-orange-200 rounded-md cursor-pointer hover:bg-orange-100 transition-colors"
            >
              <div className="relative flex justify-center items-center w-full h-96">
                {book.volumeInfo.imageLinks ? (
                  <Image
                    alt={`${book.volumeInfo.title} image`}
                    src={book.volumeInfo.imageLinks.thumbnail}
                    className="object-contain rounded-md"
                    fill
                  />
                ) : (
                  <p className="text-lg font-medium text-muted-foreground">
                    No preview image
                  </p>
                )}
              </div>
              <h1 className="text-2xl font-bold text-center">
                {book.volumeInfo.title}
              </h1>
              {book.volumeInfo.authors &&
                book.volumeInfo.authors.length > 0 && (
                  <p className="text-lg font-medium">{`Author: ${book.volumeInfo.authors[0]}`}</p>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
