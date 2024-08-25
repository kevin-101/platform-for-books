import { adminAuth, adminDB } from "@/lib/firebase-admin";
import { Filter } from "firebase-admin/firestore";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const paramUserId = req.nextUrl.searchParams.get("id");
  const email = req.nextUrl.searchParams.get("email");
  const name = req.nextUrl.searchParams.get("name");
  const idToken = req.headers.get("Authorization")?.split("Bearer ")[1];

  if (!idToken) {
    if (!email && !paramUserId && !name) {
      return Response.json("No email, name or id provided", { status: 400 });
    }
  }

  if (!adminDB) {
    return Response.json("Database error: No database found", { status: 500 });
  }

  if (!adminAuth) {
    return Response.json("Auth error: Cannot connect to auth server", {
      status: 500,
    });
  }

  const userId: string | null = idToken
    ? (await adminAuth.verifyIdToken(idToken)).uid
    : paramUserId;

  try {
    if (!email && !name) {
      const userSnapshot = await adminDB.doc(`users/${userId}`).get();
      const user: User = userSnapshot.data() as User;

      if (user) {
        return Response.json(
          { message: "Query successfull", data: user },
          { status: 200 }
        );
      } else {
        return Response.json(
          { message: "No user found", data: [] },
          { status: 200 }
        );
      }
    }

    const userSnapshot = await adminDB
      .collection("users")
      .where(
        Filter.or(
          Filter.where("displayName", "==", name),
          Filter.where("email", "==", email)
        )
      )
      .where("id", "!=", userId)
      .get();
    const users: User[] = userSnapshot.docs.map((user) => user.data() as User);
    console.log(users);

    if (users && users.length > 0) {
      return Response.json(
        { message: "Query successfull", data: users },
        { status: 200 }
      );
    } else {
      return Response.json(
        { message: "No users found", data: [] },
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
