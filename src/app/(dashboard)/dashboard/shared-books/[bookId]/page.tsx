"use client";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db, storage } from "@/lib/firebase";
import {
  arrayRemove,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { toast } from "sonner";
import BookLoading from "./loading";
import { useAuthContext } from "@/components/AuthProvider";

type SharedBookPageProps = {
  params: {
    bookId: string;
  };
};

// TODO: make edit and delete buttons visible only on books shared by the user
export default function SharedBookPage({
  params: { bookId },
}: SharedBookPageProps) {
  const [user] = useAuthContext();
  const [sharedBook, bookLoading] = useDocumentData(
    doc(
      db,
      `shared-books/${user?.uid}/book-details/${bookId}`
    ) as DocumentReference<Omit<UserSharedBook, "bookDocId">, DocumentData>
  );

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const router = useRouter();

  async function handleDelete() {
    if (user && sharedBook) {
      try {
        setDeleteLoading(true);
        const bookImageRef = ref(storage, sharedBook.bookImageUrl);
        await deleteObject(bookImageRef);

        await deleteDoc(
          doc(db, `shared-books/${user.uid}/book-details/${bookId}`)
        );
        await updateDoc(doc(db, `all-shared-books/${sharedBook.bookId}`), {
          userIds: arrayRemove(user.uid),
        });

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

  if (bookLoading) {
    return <BookLoading />;
  }

  return (
    <div className="w-full h-full px-4 pt-4 md:py-8">
      <div className="flex flex-col xl:flex-row gap-4 xl:gap-0 items-center w-full h-full">
        <div className="flex items-center w-full aspect-video xl:h-full bg-muted">
          <div className="relative flex items-center aspect-video xl:aspect-square">
            {sharedBook && (
              <img
                src={sharedBook.bookImageUrl}
                alt={`${sharedBook.bookName} image`}
                className="object-contain"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col w-full gap-4 xl:px-4">
          <form className="space-y-1 w-full">
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

          <div className="flex w-full justify-end gap-4">
            {isEdit ? (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
