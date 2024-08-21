import { adminAuth, adminDB } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const firebaseIdToken = req.headers.get("Authorization")?.split("Bearer ")[1];

  if (!adminAuth) {
    return Response.json("Auth error: Cannot connect to auth server", {
      status: 500,
    });
  }

  if (!adminDB) {
    return Response.json("Database error: Cannot connect to database", {
      status: 500,
    });
  }

  const userId: string | undefined =
    firebaseIdToken && (await adminAuth.verifyIdToken(firebaseIdToken)).uid;

  if (!userId) {
    return Response.json("Not authorized", { status: 401 });
  }

  // TODO: fix timestamp returned as response
  try {
    const chatsSnapshot = await adminDB
      .collection(`chats/${userId}/chat-details`)
      .get();
    const chats = chatsSnapshot.docs.map((chat) => chat.data() as Chat);

    if (chats && chats.length > 0) {
      return Response.json(
        { message: "Query successful", data: chats },
        { status: 200 }
      );
    } else {
      return Response.json({ message: "No chats", data: [] }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return Response.json("Database error: Something went wrong", {
      status: 500,
    });
  }
}
