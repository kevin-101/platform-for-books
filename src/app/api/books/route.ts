import { adminAuth, adminDB } from "@/lib/firebase-admin";
import {
  FieldPath,
  type DocumentData,
  type QuerySnapshot,
} from "firebase-admin/firestore";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  const idToken = req.headers.get("Authorization")?.split("Bearer ")[1];

  if (!idToken) {
    return Response.json("Not authorized", { status: 401 });
  }

  if (!query) {
    return Response.json("Query not provided", { status: 400 });
  }

  if (!adminAuth) {
    return Response.json("Auth error: Cannot connect auth server", {
      status: 500,
    });
  }

  if (!adminDB) {
    return Response.json("Database error: Cannot connect to database", {
      status: 500,
    });
  }

  const userId: string | undefined = (await adminAuth?.verifyIdToken(idToken))
    ?.uid;

  try {
    const bookRes = await fetch(
      `${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_URL}?key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}&q=${query}`
    );

    if (!bookRes.ok) {
      throw new Error(bookRes.statusText);
    }
    const books = (await bookRes.json()).items as Book[];
    const queryBookIds = books.map((book) => book.id);
    console.log(`Book ids: \n ${queryBookIds}`);

    // TODO: Categorize users by book
    if (queryBookIds && queryBookIds.length > 0) {
      const bookSnapshot = (await adminDB
        .collection(`all-shared-books`)
        .where(FieldPath.documentId(), "in", queryBookIds)
        .get()) as QuerySnapshot<Omit<AllSharedBook, "bookId">, DocumentData>;

      const userIds = bookSnapshot.docs
        .map((book) => book.data().userIds)
        .flat();

      if (userIds && userIds.length > 0) {
        const userSnapshot = await adminDB
          .collection("users")
          .where("id", "in", userIds)
          .where("id", "!=", userId)
          .get();
        const users = userSnapshot.docs.map((user) => user.data() as User);

        return Response.json(
          { message: "Query successful", data: users },
          { status: 200 }
        );
      }
    }

    return Response.json(
      { message: "No users with the books you are looking for", data: [] },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json("Database error: Something went wrong", {
      status: 500,
    });
  }
}
