import { adminAuth, adminDB } from "@/lib/firebase-admin";
import {
  type DocumentData,
  type QuerySnapshot,
} from "firebase-admin/firestore";
import { type NextRequest } from "next/server";

function getUniqueArray(a: string[]) {
  var seen: any = {};
  var out = [];
  var len = a.length;
  var j = 0;
  for (var i = 0; i < len; i++) {
    var item = a[i];
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
}

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
    // TODO: this fetch has different results in production
    const bookRes = await fetch(
      `${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_URL}?key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}&q=${query}`
    );

    if (!bookRes.ok) {
      throw new Error(bookRes.statusText);
    }
    const books = (await bookRes.json()).items as Book[];
    const queryBookIds = books.map((book) => book.id);

    // for testing
    const bookNames = books.map((book) => book.volumeInfo.title);
    console.log(bookNames);

    if (queryBookIds && queryBookIds.length > 0) {
      const bookSnapshot = (await adminDB
        .collection(`shared-books`)
        .where("bookId", "in", queryBookIds)
        .where("userId", "!=", userId)
        .get()) as QuerySnapshot<
        Omit<UserSharedBook, "bookDocId">,
        DocumentData
      >;

      if (bookSnapshot.empty) {
        return Response.json(
          { message: "No users with the books you are looking for", data: [] },
          { status: 200 }
        );
      }

      const books = bookSnapshot.docs.map((book) => {
        return { bookDocId: book.id, ...book.data() };
      });

      const bookNames = books.map((book) => book.bookName);

      const booksAndUsers = getUniqueArray(bookNames).map((name) => {
        return {
          bookName: name,
          userIds: books
            .filter((val) => val.bookName === name)
            .map((val) => val.userId),
        };
      });

      const userIds = bookSnapshot.docs.map((book) => book.data().userId);
      const userSnapshot = await adminDB
        .collection("users")
        .where("id", "in", userIds)
        .where("id", "!=", userId)
        .get();

      if (userSnapshot.empty) {
        return Response.json(
          { message: "No users with the books you are looking for", data: [] },
          { status: 200 }
        );
      }

      const users = userSnapshot.docs.map((user) => user.data() as User);
      const categorizedUsers = booksAndUsers.map((val) => {
        return {
          bookName: val.bookName,
          users: val.userIds
            .map((id) => {
              return users.filter((user) => user.id === id);
            })
            .flat(),
        };
      });

      return Response.json(
        { message: "Query successful", data: categorizedUsers },
        { status: 200 }
      );
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
