import SharedBook from "@/components/SharedBook";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

type SharedBookPageProps = {
  params: {
    bookId: string;
  };
};

export default async function SharedBookPage({
  params: { bookId },
}: SharedBookPageProps) {
  const idToken = cookies().get("idToken")?.value;
  const userId = idToken && (await adminAuth?.verifyIdToken(idToken))?.uid;

  const bookRes = await fetch(
    `${process.env.APP_DOMAIN}/api/shared-books?bookId=${bookId}`
  );

  if (!bookRes.ok) {
    throw new Error(bookRes.statusText);
  }
  const sharedBook = (await bookRes.json()).data as UserSharedBook;

  const isUserShared = sharedBook.userId === userId ? true : false;

  return (
    <div className="w-full h-full">
      <SharedBook
        bookId={bookId}
        sharedBook={sharedBook}
        isUserShared={isUserShared}
      />
    </div>
  );
}
