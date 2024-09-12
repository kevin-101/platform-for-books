"use client";

import { ChangeEvent, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { ImagePlusIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { deleteSharedBook } from "@/actions/firebase-actions/deleteSharedBook";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { editSharedBook } from "@/actions/firebase-actions/editSharedBook";
import { useUploadFile } from "react-firebase-hooks/storage";
import { cn } from "@/lib/utils";
import BookSelect from "./BookSelect";
import { Timestamp } from "firebase/firestore";

type SharedBookProps = {
  user: User;
  sharedBook: UserSharedBook | undefined;
  isUserShared: boolean;
};

const formSchema = z.object({
  bookName: z.string(),
});

export default function SharedBook({
  user,
  sharedBook,
  isUserShared,
}: SharedBookProps) {
  // state of the form
  const [isEdit, setIsEdit] = useState<boolean>(false);

  // state related to the book
  const [newBook, setNewBook] = useState<{
    bookId: string;
    bookName: string;
  }>();
  const [imageFile, setImageFile] = useState<File>();
  const [bookImagePath, setBookImagePath] = useState<
    string | ArrayBuffer | null
  >();

  // loading states
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // to upload new image if provided
  const [uploadNewImage] = useUploadFile();

  const router = useRouter();

  // rhf form handler
  const {
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookName: sharedBook?.bookName,
    },
  });

  async function handleDelete(
    user: User,
    sharedBook: UserSharedBook | undefined
  ) {
    if (user && sharedBook) {
      try {
        setDeleteLoading(true);

        const bookImageRef = ref(storage, sharedBook.bookImageUrl);

        await Promise.all([
          deleteObject(bookImageRef),
          deleteSharedBook(sharedBook.bookDocId, user.id),
        ]);

        toast.success("Book deleted");
        router.replace("/dashboard/profile");
      } catch (error) {
        toast.error("Something went wrong");
        console.log(error);
      } finally {
        setDeleteLoading(false);
      }
    }
  }

  function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (files && files[0]) {
      setImageFile(files[0]);

      const fileReader = new FileReader();

      fileReader.addEventListener("load", (e) => {
        setBookImagePath(e.target?.result);
      });
      fileReader.readAsDataURL(files[0]);
    }
  }

  const editBook = handleSubmit(async (data) => {
    if (sharedBook) {
      try {
        setEditLoading(true);

        let newImageUrl: string | undefined;

        if (imageFile) {
          deleteObject(ref(storage, sharedBook.bookImageUrl));

          const newImageRef = ref(
            storage,
            `${user.id}/${data.bookName}.${imageFile.type.split("/")[1]}`
          );
          await uploadNewImage(newImageRef, imageFile);
          newImageUrl = await getDownloadURL(newImageRef);
        }

        await editSharedBook(
          sharedBook.bookDocId,
          user.id,
          newBook,
          newImageUrl
        );

        toast.success("Book updated successfully");
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      } finally {
        setEditLoading(false);
        setIsEdit(false);
        setNewBook(undefined);
        setValue("bookName", sharedBook.bookName);
      }
    }
  });

  return (
    <div className="flex flex-col 2xl:flex-row gap-4 2xl:gap-0 items-center w-full 2xl:h-full">
      {/* shared book image container */}
      <div className="flex flex-col items-center justify-center w-full 2xl:max-w-[50%] 2xl:h-full 2xl:bg-muted">
        {/* user details for smaller screens */}
        <div className="flex 2xl:hidden gap-4 justify-start items-center w-full px-4 py-2">
          <div className="shrink-0 relative size-10">
            {user && (
              <Image
                src={user.photoUrl}
                alt={`${user.displayName} iamge`}
                fill
                className="object-cover rounded-full"
              />
            )}
          </div>

          <div className="flex flex-col w-full">
            <h2 className="text-lg font-bold">{user?.displayName}</h2>
            {sharedBook && (
              <p className="text-sm font-medium">
                {new Timestamp(
                  sharedBook.timestamp._seconds,
                  sharedBook.timestamp._nanoseconds
                )
                  .toDate()
                  .toLocaleDateString("en-GB")}
              </p>
            )}
          </div>
        </div>

        <div className="relative flex justify-center w-full min-h-40 2xl:h-screen">
          {/* image select input overlay for edit state */}
          {isEdit && (
            <>
              <label
                htmlFor="bookImage"
                className="group absolute inset-0 bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <ImagePlusIcon className="size-8 md:size-10 text-foreground/70 top-1/2 group-hover:text-foreground" />
                  <p className="text-lg font-medium text-center text-foreground/70 group-hover:text-foreground">
                    Select new Image {"("}Optional{")"}
                  </p>
                </div>
              </label>

              <input
                id="bookImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e)}
              />
            </>
          )}

          {/* shared book image */}
          {sharedBook && (
            <img
              src={
                isEdit && bookImagePath
                  ? (bookImagePath as string)
                  : sharedBook.bookImageUrl
              }
              alt={`${sharedBook.bookName} image`}
              className="object-contain"
            />
          )}
        </div>
      </div>

      {/* shared book details container */}
      <div className="flex flex-col w-full h-full 2xl:border-l border-orange-200">
        {/* user details */}
        <div className="hidden 2xl:flex gap-4 justify-start items-center py-2 px-4 border-b border-orange-200">
          <div className="shrink-0 relative size-10">
            {user && (
              <Image
                src={user.photoUrl}
                alt={`${user.displayName} iamge`}
                fill
                className="object-cover rounded-full"
              />
            )}
          </div>

          <div className="flex flex-col w-full">
            <h2 className="text-lg font-bold">{user?.displayName}</h2>
            {sharedBook && (
              <p className="text-sm font-medium">
                {new Timestamp(
                  sharedBook.timestamp._seconds,
                  sharedBook.timestamp._nanoseconds
                )
                  .toDate()
                  .toLocaleDateString("en-GB")}
              </p>
            )}
          </div>
        </div>

        {/* book details and edit fields */}
        <form onSubmit={editBook} className="flex-1 relative">
          <div
            className={cn(
              "2xl:absolute 2xl:inset-0 flex flex-col justify-center gap-4 px-4 py-4 h-full 2xl:overflow-y-auto",
              {
                "justify-center": !isEdit,
              }
            )}
          >
            <div className="space-y-1">
              <div className="flex flex-col">
                <label htmlFor={sharedBook?.bookId} className="font-medium">
                  Name
                </label>

                <Controller
                  name="bookName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      id={sharedBook?.bookId}
                      disabled
                      className={`${isEdit && "hidden"}`}
                      {...field}
                    />
                  )}
                />

                {isEdit && (
                  <BookSelect
                    value={newBook}
                    setValue={(bookId, bookName) => {
                      setNewBook({ bookId: bookId, bookName: bookName });
                      setValue("bookName", bookName);
                    }}
                  />
                )}
              </div>

              {isEdit && (
                <p className="text-sm font-medium text-red-600 min-h-6">
                  {errors.bookName?.message}
                </p>
              )}
            </div>

            {isEdit && (
              <>
                <Button
                  type="submit"
                  disabled={(!imageFile && !newBook) || editLoading}
                >
                  {editLoading ? (
                    <Loader2Icon className="animate-spin size-5" />
                  ) : (
                    "Save"
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEdit(false);
                    reset();
                    setBookImagePath(undefined);
                    setNewBook(undefined);
                  }}
                  className="2xl:hidden"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </form>

        {isUserShared && (
          <div className="flex w-full justify-end gap-4 py-2 px-4 2xl:border-t xl:border-orange-200">
            {isEdit ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEdit(false);
                    reset();
                    setBookImagePath(undefined);
                    setNewBook(undefined);
                  }}
                  className="hidden 2xl:block"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleteLoading}>
                      {deleteLoading ? (
                        <Loader2Icon className="size-5 animate-spin" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm delete</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this shared book.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(user, sharedBook)}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  onClick={() => {
                    setIsEdit(true);
                    setValue("bookName", "");
                  }}
                >
                  Edit
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
