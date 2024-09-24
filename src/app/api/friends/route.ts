import { adminAuth, adminDB } from "@/lib/firebase-admin";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const firebaseIdToken = req.headers.get("Authorization")?.split("Bearer ")[1];

  if (!adminAuth) {
    return Response.json("Auth error: Cannot connect to auth server", {
      status: 500,
    });
  }

  if (!adminDB) {
    return Response.json("Database error: Database not found", {
      status: 500,
    });
  }

  let userId: string | undefined;
  if (firebaseIdToken) {
    userId = (await adminAuth.verifyIdToken(firebaseIdToken)).uid;
  }

  if (!userId) {
    return Response.json("Not authorized", { status: 401 });
  }

  try {
    const idSnapshot = await adminDB.collection("friends").doc(userId).get();
    const friendIds = idSnapshot?.data() as { ids: string[] };

    if (friendIds.ids && friendIds.ids.length > 0) {
      const userSnapsot = await adminDB
        .collection("users")
        .where("id", "in", friendIds.ids)
        .get();
      const friends: User[] = userSnapsot.docs.map(
        (friend) => friend.data() as User
      );
      console.log(friends);

      return Response.json(
        { message: "Query successfull", data: friends },
        { status: 200 }
      );
    } else {
      return Response.json(
        { message: "No friends found", data: [] },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error);

    return new Response("Database error: Something went wrong", {
      status: 500,
    });
  }
}
