import { Input } from "@/components/ui/input";

export default function AddFriendLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-8 bg-background">
      <div className="flex flex-col w-full gap-4 justify-start">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-lg font-medium">
          Find and Chat with users with books you are looking for
        </p>
      </div>

      <div className="w-full bg-background sticky top-11 lg:top-0 z-40">
        <div className="flex gap-2 w-full lg:w-3/4 xl:w-1/2 py-2">
          <Input disabled placeholder="Please wait... Loading" />
          <div className="invisible h-10 w-16" />
        </div>
      </div>

      <p className="text-lg font-medium text-muted-foreground w-full text-center">
        No results
      </p>
    </div>
  );
}
