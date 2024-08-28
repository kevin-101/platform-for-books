"use client";

import { ClassValue } from "clsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useUploadFile } from "react-firebase-hooks/storage";
import { toast } from "sonner";
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { ChevronsUpDownIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";
import LoadingComp from "./LoadingComp";
import { addBook } from "@/lib/firebase-actions/addBook";

type AddBookButtonProps = {
  className?: ClassValue;
  user: User | undefined;
};

export default function AddBookButton({ className, user }: AddBookButtonProps) {
  // for dialog
  const [dialogState, setDialogState] = useState<boolean>(false);

  // for the search input inside the dialog
  const [queryResults, setQueryResults] = useState<Book[] | undefined>();
  const [resultsLoading, setResultsLoading] = useState<boolean>(false);

  // for the book select button
  const [bookSelectState, setBookSelectState] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<
    { bookId: string; bookName: string } | undefined
  >();

  // for the file select input
  const bookImageRef = useRef<HTMLInputElement>(null);
  const [previewPath, setPreviewPath] = useState<
    string | ArrayBuffer | null | undefined
  >();

  // for image upload
  const [uploadImage, uploadLoading, imageUploadSnapshot] = useUploadFile();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (imageUploadSnapshot) {
      setUploadProgress(
        Math.floor(
          (imageUploadSnapshot.bytesTransferred /
            imageUploadSnapshot.totalBytes) *
            100
        )
      );
    }
  }, [imageUploadSnapshot]);

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

  function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (files && files[0]) {
      const fileReader = new FileReader();

      fileReader.addEventListener("load", (e) => {
        setPreviewPath(e.target?.result);
      });
      fileReader.readAsDataURL(files[0]);
    }
  }

  async function handleAdd() {
    const imageFiles = bookImageRef.current?.files;

    if (imageFiles && imageFiles[0] && selectedBook && user) {
      try {
        const imageRef = ref(
          storage,
          `${user.id}/${selectedBook.bookName}.${
            imageFiles[0].type.split("/")[1]
          }`
        );
        await uploadImage(imageRef, imageFiles[0]);
        const uploadedImageUrl = await getDownloadURL(imageRef);
        setUploadProgress(0);

        await addBook(selectedBook, user, uploadedImageUrl);

        setDialogState(false);
        toast.success("Book added successfully");
      } catch (error) {
        setDialogState(false);
        toast.error("Something went wrong");
        console.log(error);
      }
    }
  }

  return (
    <Dialog
      open={dialogState}
      onOpenChange={(open) => {
        setDialogState(open);
        setPreviewPath("");
        setSelectedBook(undefined);
      }}
    >
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex justify-center items-center bg-orange-100 hover:bg-orange-200 transition-colors",
            className
          )}
        >
          <PlusIcon className="size-10 md:size-14" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add book</DialogTitle>
          <DialogDescription>
            Add a book to your profile. This will be visible to other users
            looking for this book
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8">
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
                  {selectedBook ? selectedBook.bookName : "Select book"}
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
                            className="py-2 px-4 hover:bg-orange-100 rounded-md cursor-pointer"
                            onClick={() => {
                              setSelectedBook({
                                bookId: book.id,
                                bookName: book.volumeInfo.title,
                              });
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

          <div className="flex flex-col gap-2 w-full">
            <p className="font-medium">Choose an image of your book</p>
            <Input
              ref={bookImageRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleImageSelect(e)}
            />
          </div>

          <div className="relative flex justify-center items-center w-full h-60 overflow-hidden bg-muted rounded-md">
            {previewPath ? (
              <img
                src={previewPath as string}
                alt="Book image preview"
                className="object-contain rounded-md"
              />
            ) : (
              <p className="text-lg font-medium text-muted-foreground">
                Image preview
              </p>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-2 w-full",
              !imageUploadSnapshot && "invisible"
            )}
          >
            <Progress
              value={uploadProgress}
              className="flex-1 *:bg-orange-500"
            />
            <span className="font-bold">{`${uploadProgress}%`}</span>
          </div>
        </div>

        <DialogFooter>
          <Button disabled={uploadLoading} onClick={() => handleAdd()}>
            {uploadLoading ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
