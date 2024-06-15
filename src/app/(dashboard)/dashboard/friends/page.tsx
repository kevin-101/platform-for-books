import FriendsList from "@/components/FriendsList";

export default function FriendsPage() {
  return (
    <div className="flex flex-col gap-8 items-center p-4 pt-8">
      <div className="flex w-full justify-start">
        <h1 className="text-3xl font-bold">Friends</h1>
      </div>
      <FriendsList />
    </div>
  );
}
