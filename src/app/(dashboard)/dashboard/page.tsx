import TopBooks from "@/components/TopBooks";

export default function Page() {
  return (
    <div className="grid md:grid-cols-3 px-4 py-6">
      {/* Top Searched Books */}
      <div className="flex flex-col gap-8 md:col-span-1 min-h-20 border border-border rounded-md p-4">
        <h2 className="text-xl font-medium">Top searched books</h2>
        <TopBooks />
      </div>
    </div>
  );
}
