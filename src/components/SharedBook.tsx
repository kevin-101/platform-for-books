"use client";

import { useState } from "react";
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
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { deleteSharedBook } from "@/actions/firebase-actions/deleteSharedBook";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { editSharedBook } from "@/actions/firebase-actions/editSharedBook";
import { useUploadFile } from "react-firebase-hooks/storage";
import { cn } from "@/lib/utils";

type SharedBookProps = {
  user: User;
  sharedBook: UserSharedBook | undefined;
  isUserShared: boolean;
};

const formSchema = z.object({
  bookName: z
    .string()
    .min(1, "Book name cannot be empty")
    .max(30, "Book name can only be a maximum of 30 characters"),
});

export default function SharedBook({
  user,
  sharedBook,
  isUserShared,
}: SharedBookProps) {
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [newBookId, setNewBookId] = useState<string>();
  const [imageFile, setImageFile] = useState<File>();
  const [bookImagePath, setBookImagePath] = useState<string>();

  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);

  const [uploadNewImage] = useUploadFile();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

  const editBook = handleSubmit(async (data) => {
    if (sharedBook && newBookId) {
      try {
        setEditLoading(true);

        let newImageUrl: string | undefined;

        if (imageFile) {
          deleteObject(ref(storage, sharedBook.bookImageUrl));
          await uploadNewImage(ref(storage, `${user.id}/`), imageFile);
        }

        await editSharedBook(
          sharedBook.bookDocId,
          user.id,
          newBookId,
          data.bookName,
          newImageUrl
        );

        toast.success("Book updated successfully");
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      } finally {
        setEditLoading(false);
      }
    }
  });

  return (
    <div className="flex flex-col 2xl:flex-row gap-4 2xl:gap-0 items-center w-full 2xl:h-full">
      <div className="flex flex-col items-center justify-center w-full 2xl:max-w-[50%] 2xl:h-full 2xl:bg-muted">
        <div className="flex 2xl:hidden gap-4 justify-start items-center w-full px-4 py-2">
          <div className="relative size-8">
            {user && (
              <Image
                src={user.photoUrl}
                alt={`${user.displayName} iamge`}
                fill
                className="object-cover rounded-full"
              />
            )}
          </div>

          <h2 className="text-lg font-bold">{user?.displayName}</h2>
        </div>

        {/* shared book image */}
        <div className="relative flex justify-center w-full min-h-40 2xl:h-screen">
          {sharedBook && (
            <img
              src={sharedBook.bookImageUrl}
              alt={`${sharedBook.bookName} image`}
              className="object-contain"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col w-full h-full 2xl:border-l border-orange-200">
        <div className="hidden 2xl:flex gap-4 justify-start items-center py-2 px-4 border-b border-orange-200">
          <div className="relative size-8">
            {user && (
              <Image
                src={user.photoUrl}
                alt={`${user.displayName} iamge`}
                fill
                className="object-cover rounded-full"
              />
            )}
          </div>

          <h2 className="text-lg font-bold">{user?.displayName}</h2>
        </div>

        {/* book details and edit fields */}
        <form onSubmit={editBook} className="flex-1 relative">
          <div
            className={cn(
              "2xl:absolute 2xl:inset-0 flex flex-col gap-4 px-4 py-4 h-full 2xl:overflow-y-auto",
              {
                "justify-center": !isEdit,
              }
            )}
          >
            <div className="space-y-1">
              <div>
                <label htmlFor={sharedBook?.bookId} className="font-medium">
                  Name
                </label>
                <Input
                  type="text"
                  id={sharedBook?.bookId}
                  disabled={!isEdit}
                  {...register("bookName", { required: true })}
                />
              </div>

              {isEdit && (
                <p className="text-sm font-medium text-red-600 min-h-6">
                  {errors.bookName?.message}
                </p>
              )}
            </div>

            {isEdit && (
              <>
                <div className="space-y-1">
                  <div>
                    <label htmlFor="bookImage" className="font-medium">
                      Book Image {"("}optional{")"}
                    </label>
                    <Input
                      type="file"
                      id="bookImage"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) setImageFile(e.target.files[0]);
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-center items-center w-full min-h-52 2xl:min-h-60 aspect-video bg-muted rounded-md">
                  {bookImagePath ? (
                    <img
                      src={bookImagePath}
                      alt="Selected book Image"
                      className="object-contain"
                    />
                  ) : (
                    <p className="text-lg font-medium text-muted-foreground">
                      Image preview
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={editLoading}>
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

                <Button onClick={() => setIsEdit(true)}>Edit</Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
