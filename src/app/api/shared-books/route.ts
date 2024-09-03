import { adminDB } from "@/lib/firebase-admin";
import { FieldPath } from "firebase-admin/firestore";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id");
  const bookId = req.nextUrl.searchParams.get("bookId");

  if (!userId && !bookId) {
    return Response.json("User ID nor Book ID provided", { status: 400 });
  }

  if (!adminDB) {
    return Response.json("Database error: Cannot connect to database", {
      status: 500,
    });
  }

  try {
    if (bookId) {
      const bookSnapshot = await adminDB
        .collection(`shared-books`)
        .doc(bookId)
        .get();

      if (!bookSnapshot.exists) {
        return Response.json(
          { message: "No books found", data: [] },
          { status: 200 }
        );
      }

      const sharedBook = { bookDocId: bookSnapshot.id, ...bookSnapshot.data() };

      return Response.json(
        { message: "Query successful", data: sharedBook },
        { status: 200 }
      );
    }

    if (userId) {
      const bookSnapshot = await adminDB
        .collection(`user-shared-books`)
        .doc(userId)
        .get();

      if (!bookSnapshot.exists) {
        return Response.json(
          { message: "No books found", data: [] },
          { status: 200 }
        );
      }

      const sharedBookIds = bookSnapshot.data() as { bookIds: string[] };

      const sharedBookSnapshot = (await adminDB
        .collection(`shared-books`)
        .where(FieldPath.documentId(), "in", sharedBookIds.bookIds)
        .get()) as FirebaseFirestore.QuerySnapshot<
        Omit<UserSharedBook, "bookDocId">,
        FirebaseFirestore.DocumentData
      >;

      if (sharedBookSnapshot.empty) {
        return Response.json(
          { message: "No books found", data: [] },
          { status: 200 }
        );
      }

      const sharedBooks: UserSharedBook[] = sharedBookSnapshot.docs.map(
        (book) => {
          return {
            bookDocId: book.id,
            ...book.data(),
          };
        }
      );

      return Response.json(
        { message: "Query successful", data: sharedBooks },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error);
    return Response.json("Database error: Something went wrong", {
      status: 500,
    });
  }
}
