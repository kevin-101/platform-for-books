import Image from "next/image";
import Link from "next/link";

type SharedBooksProps = {
  user: User | undefined;
};

export default async function SharedBooks({ user }: SharedBooksProps) {
  const booksRes = await fetch(
    `${process.env.APP_DOMAIN}/api/shared-books?id=${user?.id}`
  );

  if (!booksRes.ok) {
    const responseMsg = await booksRes.text();
    throw new Error(responseMsg);
  }
  const sharedBooks = (await booksRes.json()).data as UserSharedBook[];

  return (
    sharedBooks &&
    sharedBooks.map((book) => {
      return (
        <Link
          key={book.bookDocId}
          href={`/dashboard/shared-books/${book.bookDocId}`}
          className="group relative aspect-square cursor-pointer"
        >
          <Image
            src={book.bookImageUrl}
            alt={`${book.bookName} image`}
            fill
            className="object-cover group-hover:opacity-85 transition-opacity rounded-md"
          />
        </Link>
      );
    })
  );
}
