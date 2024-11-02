import { Input } from "@/components/ui/input";

export default function AddFriendLoading() {
  return (
    <div className="flex flex-col w-full gap-6 pt-8 px-4">
      <div className="flex flex-col gap-4 w-full">
        <h1 className="text-3xl font-bold">Add friend</h1>
        <p className="text-lg font-medium">Add your friends to chat</p>
      </div>

      <div className="w-full bg-background sticky top-11 lg:top-0 z-40">
        <div className="flex gap-2 w-full lg:w-3/4 xl:w-1/2 py-2">
          <Input disabled placeholder="Please wait... Loading" />
          <div className="invisible h-10 w-16" />
        </div>
      </div>

      <h1 className="text-lg font-medium text-muted-foreground text-center">
        No Matching Users Found
      </h1>
    </div>
  );
}
