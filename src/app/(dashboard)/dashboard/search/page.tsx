"use client";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

export default function SearchPage() {
  const [queryResults, setQueryResults] = useState<Book[] | undefined>();

  async function searchBooks(e: ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;

    if (query && query.length > 0) {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}`
      );
      const data = await response.json();
      console.log(data);

      setQueryResults(data.items);
    } else {
      setQueryResults([]);
    }
  }

  return (
    <div className="flex flex-col gap-10 p-4 pt-8">
      <div className="flex flex-col w-full lg:w-1/2 gap-4 justify-start">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-lg font-medium">
          Serach for users with books you are looking for
        </p>
        <Input
          type="text"
          placeholder="Search for users"
          onChange={(e) => searchBooks(e)}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 w-full items-center">
        {queryResults?.map((book) => {
          return (
            <div
              key={book.id}
              className="flex flex-col gap-2 w-full min-h-full items-center py-4 border border-orange-200 rounded-md"
            >
              <div className="relative size-96">
                {book.volumeInfo.imageLinks && (
                  <Image
                    alt="sndvkj"
                    src={book.volumeInfo.imageLinks.thumbnail}
                    className="rounded-md"
                    fill
                  />
                )}
              </div>
              <h1 className="text-2xl font-bold text-center">
                {book.volumeInfo.title}
              </h1>
              <p className="text-lg font-medium">Author:</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
