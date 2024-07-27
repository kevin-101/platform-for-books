import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookLoading() {
  return (
    <div className="w-full h-full px-4 pt-4 md:py-8">
      <div className="flex flex-col xl:flex-row gap-4 xl:gap-0 items-center w-full h-full">
        <Skeleton className="w-full h-auto xl:h-full rounded-none" />

        <div className="flex flex-col w-full gap-4 px-4">
          <div className="space-y-1 w-full">
            <label className="font-medium">Name</label>
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="flex w-full justify-end gap-4">
            <Button variant="destructive">Delete</Button>
            <Button>Edit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
