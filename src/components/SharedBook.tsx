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
import { useAuthContext } from "./AuthProvider";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { deleteSharedBook } from "@/lib/firebase-actions/deleteSharedBook";
import Image from "next/image";

type SharedBookProps = {
  sharedBook: UserSharedBook | undefined;
  isUserShared: boolean;
};

export default function SharedBook({
  sharedBook,
  isUserShared,
}: SharedBookProps) {
  const [user] = useAuthContext();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const router = useRouter();

  async function handleDelete() {
    if (user && sharedBook) {
      try {
        setDeleteLoading(true);

        const bookImageRef = ref(storage, sharedBook.bookImageUrl);
        await deleteObject(bookImageRef);

        await deleteSharedBook(sharedBook.bookId, user.uid);

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

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-0 items-center w-full h-full">
      <div className="flex items-center min-w-[50%] w-full md:w-auto xl:h-full bg-muted">
        <div className="relative flex">
          {sharedBook && (
            <img
              src={sharedBook.bookImageUrl}
              alt={`${sharedBook.bookName} image`}
              className="object-contain"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col w-full h-full gap-4 bg-orange-50">
        <div className="flex gap-4 justify-start items-center order-first xl:order-none py-2 xl:px-4 border-b border-orange-200">
          <div className="relative size-8">
            <Image
              src={user?.photoURL!}
              alt={`${user?.displayName} iamge`}
              fill
              className="object-cover rounded-full"
            />
          </div>

          <h2 className="text-lg font-bold">{user?.displayName}</h2>
        </div>

        <form className="flex-1 flex flex-col justify-center gap-1 xl:px-4 w-full">
          <label htmlFor={sharedBook?.bookId} className="font-medium">
            Name
          </label>
          <Input
            type="text"
            id={sharedBook?.bookId}
            defaultValue={sharedBook?.bookName}
            disabled={!isEdit}
          />
        </form>

        <div className="flex w-full justify-end gap-4 py-2 xl:px-4">
          {isUserShared &&
            (isEdit ? (
              <>
                <Button variant="outline" onClick={() => setIsEdit(false)}>
                  Cancel
                </Button>
                <Button>Save</Button>
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
                      <AlertDialogAction onClick={() => handleDelete()}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button onClick={() => setIsEdit(true)}>Edit</Button>
              </>
            ))}
        </div>
      </div>
    </div>
  );
}
