import { Skeleton } from "@/components/ui/skeleton";

export default function BookLoading() {
  return (
    <div className="w-full h-full">
      <div className="flex flex-col 2xl:flex-row gap-4 2xl:gap-0 items-center w-full h-full">
        <div className="flex flex-col items-center justify-start w-full 2xl:h-full 2xl:bg-muted">
          <div className="flex 2xl:hidden gap-4 justify-start items-center w-full px-4 py-2">
            <Skeleton className="shrink-0 size-10 rounded-full" />

            <div className="flex flex-col gap-1 w-full">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </div>

          <Skeleton className="relative flex w-full h-96 rounded-none" />
        </div>

        <div className="flex flex-col w-full h-full gap-4 2xl:border-l border-border">
          <div className="hidden 2xl:flex gap-4 justify-start items-center py-2 px-4 border-b border-border">
            <Skeleton className="shrink-0 size-10 rounded-full" />

            <div className="flex flex-col gap-1 w-full">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-1 px-4 w-full overflow-y-auto">
            <label className="font-medium">Name</label>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
