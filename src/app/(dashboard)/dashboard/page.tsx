import FriendBooks from "@/components/FriendBooks";
import TopBooks from "@/components/TopBooks";

export default function Page() {
  return (
    <div className="grid md:grid-cols-3 gap-4 px-4 py-6">
      {/* Top Searched Books */}
      <div className="flex flex-col gap-8 md:col-span-1 min-h-20 border border-border rounded-md p-4">
        <h2 className="text-xl font-medium">Top searched books</h2>
        <TopBooks />
      </div>

      {/* Books shared by friends */}
      <div className="flex flex-col gap-8 md:col-span-2 min-h-20 border border-border rounded-md p-4">
        <h2 className="text-xl font-medium">Books shared by friends</h2>
        <FriendBooks />
      </div>
    </div>
  );
}
