import SearchField from "@/components/SearchField";
import UserSearchResults from "@/components/UserSearchResults";
import { cookies } from "next/headers";

type AddFriendPageProps = {
  searchParams?: {
    q?: string;
  };
};

export default async function AddFriendPage({
  searchParams,
}: AddFriendPageProps) {
  const email = searchParams?.q || "";
  const idToken = cookies().get("idToken")?.value;
  const domain = process.env.APP_DOMAIN;

  const friendsRes = await fetch(`${domain}/api/friends`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!friendsRes.ok) {
    throw new Error("Something went wrong");
  }

  const friends = (await friendsRes.json()).data as User[];
  const friendIds = friends.map((friend) => friend.id);

  return (
    <div className="flex flex-col w-full gap-6 pt-8 px-4">
      <div className="flex flex-col gap-4 w-full">
        <h1 className="text-3xl font-bold">Add friend</h1>
        <p className="text-lg font-medium">Add your friends to chat</p>
      </div>

      <div className="w-full bg-background sticky top-11 lg:top-0 z-40">
        <SearchField type="email" placeholder="Search for users" />
      </div>

      <UserSearchResults email={email} friendIds={friendIds} />
    </div>
  );
}
