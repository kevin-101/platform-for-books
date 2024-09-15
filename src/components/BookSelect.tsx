"use client";

import { ChangeEvent, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ChevronsUpDownIcon } from "lucide-react";
import { Input } from "./ui/input";
import LoadingComp from "./LoadingComp";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";

type BookSelectProps = {
  value:
    | {
        bookId: string;
        bookName: string;
      }
    | undefined;
  setValue: (bookId: string, bookName: string) => void;
};

export default function BookSelect({ value, setValue }: BookSelectProps) {
  // popover state
  const [bookSelectState, setBookSelectState] = useState<boolean>(false);

  // for popover content
  const [queryResults, setQueryResults] = useState<Book[]>();
  const [resultsLoading, setResultsLoading] = useState<boolean>(false);

  const handleSearch = useDebouncedCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setResultsLoading(true);

      if (query && query.length > 0) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_URL}?key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}&q=${query}`
          );

          if (!res.ok) {
            throw new Error(res.statusText);
          }
          const data = await res.json();

          setQueryResults(data.items);
        } catch (error) {
          console.log(error);
          toast.error("Something went wrong");
        } finally {
          setResultsLoading(false);
        }
      } else {
        setQueryResults([]);
        setResultsLoading(false);
      }
    },
    600
  );

  return (
    <Popover
      open={bookSelectState}
      onOpenChange={(open) => {
        setBookSelectState(open);
        setQueryResults([]);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          <span className="flex-1 w-32 text-start overflow-hidden text-ellipsis">
            {value ? value.bookName : "Select book"}
          </span>
          <ChevronsUpDownIcon className="size-5" />
        </Button>
      </PopoverTrigger>

      {/* documentation for --radix-popover-trigger-width variable
      https://www.radix-ui.com/primitives/docs/components/popover#constrain-the-content-size */}
      <PopoverContent className="w-[--radix-popover-trigger-width] p-1">
        <div className="w-full space-y-3">
          <Input
            type="text"
            placeholder="search books"
            onChange={(e) => handleSearch(e)}
          />

          <div className="grid place-items-center w-full min-h-20">
            {resultsLoading ? (
              <LoadingComp />
            ) : queryResults && queryResults.length > 0 ? (
              <ul className="flex flex-col gap-2 p-1 h-[250px] overflow-auto w-full bg-background">
                {queryResults.map((book) => {
                  return (
                    <li
                      key={book.id}
                      className="py-2 px-4 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-md cursor-pointer"
                      onClick={() => {
                        setValue(book.id, book.volumeInfo.title);
                        setQueryResults([]);
                        setBookSelectState(false);
                      }}
                    >
                      {book.volumeInfo.title}
                      {book.volumeInfo.authors &&
                        book.volumeInfo.authors.length > 0 &&
                        `, ${book.volumeInfo.authors[0]}`}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="font-medium text-muted-foreground">
                No matching books
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
