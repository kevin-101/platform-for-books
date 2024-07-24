"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db, storage } from "@/lib/firebase";
import {
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { toast } from "sonner";

type SharedBookPageProps = {
  params: {
    bookId: string;
  };
};

export default function SharedBookPage({
  params: { bookId },
}: SharedBookPageProps) {
  const [user] = useAuthState(auth);
  const [sharedBook, bookLoading] = useDocumentData(
    doc(
      db,
      `shared-books/${user?.uid}/book-details/${bookId}`
    ) as DocumentReference<Omit<SharedBook, "bookDocId">, DocumentData>
  );

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const router = useRouter();

  async function handleDelete() {
    if (user && sharedBook) {
      try {
        const bookImageRef = ref(storage, sharedBook.bookImageUrl);
        await deleteObject(bookImageRef);

        await deleteDoc(
          doc(db, `shared-books/${user.uid}/book-details/${bookId}`)
        );

        toast.success("Book deleted");
        router.replace("/dashboard/profile");
      } catch (error) {
        toast.error("Something went wrong");
        console.log(error);
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 w-full h-full px-4 pt-4 md:pt-8">
      <div className="flex flex-col items-center w-full gap-4">
        <div className="relative w-full h-48 lg:h-96">
          <Image
            src={sharedBook?.bookImageUrl as string}
            alt={`${sharedBook?.bookName} image`}
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex flex-col w-full gap-4">
        <form className="space-y-1 w-full">
          <label htmlFor={sharedBook?.bookId} className="font-medium">
            Name
          </label>
          <Input
            type="text"
            id={sharedBook?.bookId}
            name="bookName"
            value={sharedBook?.bookName}
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
              <Button variant="destructive">Delete</Button>
              <Button onClick={() => setIsEdit(true)}>Edit</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
