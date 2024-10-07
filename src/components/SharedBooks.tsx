import { BookDashedIcon } from "lucide-react";
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

  return sharedBooks && sharedBooks.length > 0 ? (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-lg md:text-xl font-medium text-center w-full px-4">
        Your shared books
      </h2>

      <div className="grid grid-cols-3 xl:grid-cols-5 w-full gap-1 md:px-4">
        {sharedBooks.map((book) => {
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
        })}
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-4 items-center w-full">
      <BookDashedIcon className="size-24" />
      <p className="text-xl font-medium text-center">No shared books</p>
    </div>
  );
}
