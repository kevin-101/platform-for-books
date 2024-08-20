import { adminDB } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id");

  if (!userId) {
    return Response.json("User ID not provided", { status: 400 });
  }

  if (!adminDB) {
    return Response.json("Database error: Cannot connect to database", {
      status: 500,
    });
  }

  try {
    const bookSnapshot = await adminDB
      .collection(`shared-books/${userId}/book-details`)
      .get();
    if (bookSnapshot.size > 0) {
      const sharedBooks = bookSnapshot.docs.map((book) => {
        return { bookDocId: book.id, ...book.data() } as UserSharedBook;
      });

      return Response.json(
        { message: "Query successful", data: sharedBooks },
        { status: 200 }
      );
    } else {
      return Response.json(
        { message: "No books found", data: [] },
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
