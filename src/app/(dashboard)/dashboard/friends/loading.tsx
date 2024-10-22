import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { XIcon } from "lucide-react";

export default function FriendsLoading() {
  return (
    <div className="flex flex-col gap-6 items-center p-4 pt-8">
      <div className="flex w-full">
        <h1 className="text-3xl font-bold">Friends</h1>
      </div>

      <div className="flex flex-col w-full gap-6">
        <div className="w-full bg-background sticky top-11 lg:top-0 z-40">
          <div className="w-full lg:w-3/4 xl:w-1/2 py-2 flex gap-2">
            <Input disabled placeholder="Search friends" />

            <Button variant="outline" className="invisible">
              <XIcon className="size-5" />
            </Button>
          </div>
        </div>

        {[...Array(8)].map((_, i) => {
          return (
            <Skeleton
              key={i}
              className="flex justify-start items-center gap-4 p-4 bg-muted rounded-md"
            >
              <Skeleton className="size-14 rounded-full shrink-0" />
              <div className="flex flex-col w-full gap-1">
                <Skeleton className="w-1/2 h-5" />
                <Skeleton className="w-1/3 h-4" />
              </div>
            </Skeleton>
          );
        })}
      </div>
    </div>
  );
}

export function FriendsListLoading() {
  return (
    <div className="flex flex-col w-full gap-6">
      <div className="w-full bg-background sticky top-11 lg:top-0 z-40">
        <div className="w-full lg:w-3/4 xl:w-1/2 py-2 flex gap-2">
          <Input disabled placeholder="Search friends" />

          <Button variant="outline" className="invisible">
            <XIcon className="size-5" />
          </Button>
        </div>
      </div>

      {[...Array(8)].map((_, i) => {
        return (
          <Skeleton
            key={i}
            className="flex justify-start items-center gap-4 p-4 bg-muted rounded-md"
          >
            <Skeleton className="size-14 rounded-full shrink-0" />
            <div className="flex flex-col w-full gap-1">
              <Skeleton className="w-1/2 h-5" />
              <Skeleton className="w-1/3 h-4" />
            </div>
          </Skeleton>
        );
      })}
    </div>
  );
}
