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
    <div className="flex flex-col 2xl:flex-row gap-4 2xl:gap-0 items-center w-full h-full">
      <div className="flex flex-col items-center justify-center w-full 2xl:max-w-[50%] 2xl:h-full 2xl:bg-muted">
        <div className="flex 2xl:hidden gap-4 justify-start items-center w-full px-4 py-2">
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

      <div className="flex flex-col w-full h-full gap-4 2xl:border-l border-orange-200">
        <div className="hidden 2xl:flex gap-4 justify-start items-center py-2 px-4 border-b border-orange-200">
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

        <form className="flex-1 flex flex-col justify-center gap-1 px-4 w-full overflow-y-auto">
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

        {isUserShared && (
          <div className="flex w-full justify-end gap-4 py-2 px-4 2xl:border-t xl:border-orange-200">
            {isEdit ? (
              <>
                <Button>Save</Button>
                <Button variant="outline" onClick={() => setIsEdit(false)}>
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
                      <AlertDialogAction onClick={() => handleDelete()}>
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
