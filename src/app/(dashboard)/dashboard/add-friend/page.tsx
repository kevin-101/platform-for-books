import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";

const SearchField = dynamic(() => import("@/components/SearchField"), {
  loading: () => (
    <div className="flex gap-2 w-full lg:w-3/4 xl:w-1/2 py-2">
      <Input disabled placeholder="Search for users" />
      <div className="invisible h-10 w-16" />
    </div>
  ),
  ssr: false,
});
const UserSearchResults = dynamic(
  () => import("@/components/UserSearchResults"),
  {
    loading: () => (
      <h1 className="text-lg font-medium text-muted-foreground text-center">
        No Matching Users Found
      </h1>
    ),
    ssr: false,
  }
);

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
