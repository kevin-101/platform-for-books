import FriendsList from "@/components/FriendsList";
import { cookies } from "next/headers";

export default async function FriendsPage() {
  const idToken = cookies().get("idToken")?.value;

  const friendsRes = await fetch(`${process.env.APP_DOMAIN}/api/friends`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!friendsRes.ok) {
    throw new Error(friendsRes.statusText);
  }

  const friends = (await friendsRes.json()).data as User[];

  return (
    <div className="flex flex-col gap-6 items-center p-4 pt-8">
      <div className="flex w-full">
        <h1 className="text-3xl font-bold">Friends</h1>
      </div>
      <FriendsList friends={friends} />
    </div>
  );
}
