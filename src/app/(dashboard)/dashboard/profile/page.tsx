"use client";

import ErrorComp from "@/components/ErrorComp";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { auth, db, storage } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentReference,
} from "firebase/firestore";
import { ChevronsUpDownIcon, Loader2Icon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection, useDocumentData } from "react-firebase-hooks/firestore";
import ProfileLoading from "./loading";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "sonner";
import Link from "next/link";

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

  const [dialogState, setDialogState] = useState<boolean>(false);
  const [bookSelectState, setBookSelectState] = useState<boolean>(false);
  const [queryResults, setQueryResults] = useState<Book[] | undefined>();
  const [selectedBook, setSelectedBook] = useState<
    { bookId: string; bookName: string } | undefined
  >();
  const [previewPath, setPreviewPath] = useState<
    string | ArrayBuffer | null | undefined
  >();
  const [addLoading, setAddLoading] = useState<boolean>(false);

  const bookImageRef = useRef<HTMLInputElement>(null);

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
        setAddLoading(true);
        const imageRef = ref(
          storage,
          `${user.uid}/${selectedBook.bookName}.${
            imageFiles[0].type.split("/")[1]
          }`
        );
        await uploadBytes(imageRef, imageFiles[0]);
        const uploadedImageUrl = await getDownloadURL(imageRef);

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
      } finally {
        setAddLoading(false);
      }
    }
  }

  if (dbUserLoading) {
    return <ProfileLoading />;
  }

  if (dbUserError) {
    return <ErrorComp />;
  }

  return (
    <div className="flex flex-col gap-10 items-center pt-4 md:pt-8">
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

        <div className="grid grid-cols-3 md:grid-cols-5 w-full gap-[2px] md:px-4">
          <Dialog
            open={dialogState}
            onOpenChange={(open) => {
              setDialogState(open);
              setPreviewPath("");
              setSelectedBook(undefined);
            }}
          >
            <DialogTrigger asChild>
              <button className="relative flex flex-col w-full h-32 md:h-[20vw] lg:h-[15vw] justify-center items-center bg-orange-100 hover:bg-orange-200 transition-colors">
                <PlusIcon className="size-10 md:size-14" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add book</DialogTitle>
                <DialogDescription>
                  Add a book to your profile. This will be visible to other
                  users looking for this book
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-8">
                <Popover
                  open={bookSelectState}
                  onOpenChange={setBookSelectState}
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

                <div
                  className={cn(
                    "relative flex justify-center items-center w-full overflow-hidden bg-muted rounded-md",
                    previewPath ? "h-auto" : "h-60"
                  )}
                >
                  {previewPath ? (
                    <img
                      src={previewPath as string}
                      alt="Book image preview"
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <p className="text-lg font-medium text-muted-foreground">
                      Image preview
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button disabled={addLoading} onClick={() => handleAdd()}>
                  {addLoading ? (
                    <Loader2Icon className="size-5 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {sharedBooks &&
            sharedBooks.map((book) => {
              return (
                <Link
                  href={`/dashboard/profile/shared-books/${book.bookDocId}`}
                  className="group relative w-full h-32 md:h-[20vw] lg:h-[15vw] cursor-pointer"
                >
                  <Image
                    src={book.bookImageUrl}
                    alt={`${book.bookName} image`}
                    fill
                    className="object-cover group-hover:opacity-85"
                  />
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
