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
import { Loader2Icon, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { addBook } from "@/actions/firebase-actions/addBook";
import { useAuthContext } from "./AuthProvider";
import BookSelect from "./BookSelect";

type AddBookButtonProps = {
  className?: ClassValue;
};

export default function AddBookButton({ className }: AddBookButtonProps) {
  const [user] = useAuthContext();

  // for dialog
  const [dialogState, setDialogState] = useState<boolean>(false);

  // selected book using BookSelect
  const [selectedBook, setSelectedBook] = useState<
    { bookId: string; bookName: string } | undefined
  >();

  // for the file select input
  const bookImageRef = useRef<HTMLInputElement>(null);
  const [previewPath, setPreviewPath] = useState<
    string | ArrayBuffer | null | undefined
  >();

  // for image upload
  const [uploadImage, _, imageUploadSnapshot] = useUploadFile();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [addLoading, setAddLoading] = useState<boolean>(false);

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
          `${user.uid}/${selectedBook.bookName} ${new Date().toUTCString()}.${
            imageFiles[0].type.split("/")[1]
          }`
        );
        await uploadImage(imageRef, imageFiles[0]);

        const uploadedImageUrl = await getDownloadURL(imageRef);

        await addBook(selectedBook, user, uploadedImageUrl);

        toast.success("Book added successfully");
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      } finally {
        setAddLoading(false);
        setDialogState(false);
        setUploadProgress(0);
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
            "flex justify-center items-center bg-accent hover:bg-accent/70 transition-colors",
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
          <BookSelect
            value={selectedBook}
            setValue={(bookId, bookName) =>
              setSelectedBook({ bookId: bookId, bookName: bookName })
            }
          />

          <div className="flex flex-col gap-2 w-full">
            <p className="font-medium">Choose an image of your book</p>
            <Input
              ref={bookImageRef}
              type="file"
              accept="image/*"
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
            <Progress value={uploadProgress} className="flex-1 *:bg-primary" />
            <span className="font-bold text-center w-12">{`${uploadProgress}%`}</span>
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
  );
}
