import FriendBooks from "@/components/FriendBooks";
import TopBooks from "@/components/TopBooks";

export default function Page() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 gap-4 px-4 py-6">
      {/* Top Searched Books */}
      <div className="flex flex-col gap-8 border border-border rounded-md p-4">
        <h2 className="text-xl font-medium">Top searched books</h2>
        <TopBooks />
      </div>

      {/* Books shared by friends */}
      <div className="flex flex-col gap-8 xl:col-span-2 border border-border rounded-md p-4">
        <h2 className="text-xl font-medium">Books shared by friends</h2>
        <FriendBooks />
      </div>
    </div>
  );
}
