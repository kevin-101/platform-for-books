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
import { User as AuthUser } from "firebase/auth";
import { toast } from "sonner";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { ChevronsUpDownIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";

type AddBookButtonProps = {
  className?: ClassValue;
  user: AuthUser | null | undefined;
};

export default function AddBookButton({ className, user }: AddBookButtonProps) {
  const [dialogState, setDialogState] = useState<boolean>(false);
  const [bookSelectState, setBookSelectState] = useState<boolean>(false);
  const [queryResults, setQueryResults] = useState<Book[] | undefined>();
  const [selectedBook, setSelectedBook] = useState<
    { bookId: string; bookName: string } | undefined
  >();
  const [previewPath, setPreviewPath] = useState<
    string | ArrayBuffer | null | undefined
  >();

  const [uploadImage, uploadLoading, imageUploadSnapshot, uploadError] =
    useUploadFile();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const bookImageRef = useRef<HTMLInputElement>(null);

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

  async function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;

    if (query && query.length > 0) {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}`
      );
      const data = await res.json();

      setQueryResults(data.items);
    } else {
      setQueryResults([]);
    }
  }

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
          `${user.uid}/${selectedBook.bookName}.${
            imageFiles[0].type.split("/")[1]
          }`
        );
        await uploadImage(imageRef, imageFiles[0]);
        const uploadedImageUrl = await getDownloadURL(imageRef);
        setUploadProgress(0);

        await addDoc(collection(db, `shared-books/${user.uid}/book-details`), {
          bookId: selectedBook.bookId,
          bookName: selectedBook.bookName,
          bookImageUrl: uploadedImageUrl,
        });

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
          <Popover open={bookSelectState} onOpenChange={setBookSelectState}>
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

                {queryResults && queryResults.length > 0 ? (
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
                  <p className="grid place-items-center h-20 font-medium text-muted-foreground">
                    No matching books
                  </p>
                )}
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
              "flex flex-col items-center gap-2 w-full",
              !imageUploadSnapshot && "invisible"
            )}
          >
            <span className="font-bold w-full text-end">{`${uploadProgress}%`}</span>
            <Progress
              value={uploadProgress}
              className="w-full *:bg-orange-500"
            />
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
