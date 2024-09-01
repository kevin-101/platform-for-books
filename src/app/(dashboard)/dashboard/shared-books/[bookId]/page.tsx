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

  // get shared book
  const bookRes = await fetch(
    `${process.env.APP_DOMAIN}/api/shared-books?bookId=${bookId}`
  );

  if (!bookRes.ok) {
    throw new Error(bookRes.statusText);
  }

  const sharedBook = (await bookRes.json()).data as UserSharedBook;
  const isUserShared = sharedBook.userId === userId ? true : false;

  // get user from shared book
  const userRes = await fetch(
    `${process.env.APP_DOMAIN}/api/users?id=${sharedBook.userId}`
  );

  if (!userRes.ok) {
    throw new Error(userRes.statusText);
  }

  const user = (await userRes.json()).data as User;

  return (
    <div className="w-full h-full">
      <SharedBook
        user={user}
        bookId={bookId}
        sharedBook={sharedBook}
        isUserShared={isUserShared}
      />
    </div>
  );
}
