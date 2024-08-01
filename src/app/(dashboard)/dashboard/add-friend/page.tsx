import SearchField from "@/components/SearchField";
import UserSearchResults from "@/components/UserSearchResults";

type AddFriendPageProps = {
  searchParams?: {
    q?: string;
  };
};

export default function AddFriendPage({ searchParams }: AddFriendPageProps) {
  const email = searchParams?.q || "";

  return (
    <div className="flex flex-col w-full gap-6 pt-8 px-4">
      <div className="flex flex-col gap-4 w-full">
        <h1 className="text-3xl font-bold">Add friend</h1>
        <p className="text-lg font-medium">Add your friends to chat</p>
      </div>

      <div className="w-full bg-background sticky top-11 lg:top-0 z-40">
        <SearchField type="email" placeholder="Search for users" />
      </div>

      <UserSearchResults email={email} />
    </div>
  );
}
