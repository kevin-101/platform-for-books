import { Skeleton } from "@/components/ui/skeleton";

export default function UserLoading() {
  return (
    <div className="flex flex-col gap-10 items-center pt-4 md:pt-8">
      <div className="flex items-center gap-4 md:gap-8 w-full px-4">
        <Skeleton className="relative size-[5.5rem] md:size-[15.5rem] rounded-full" />
        <div className="flex flex-col flex-1 gap-2">
          <Skeleton className="w-[40%] h-6 md:h-8" />
          <Skeleton className="w-[70%] h-6 md:h-8" />
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-lg md:text-xl font-medium text-center w-full px-4">
          Shared books
        </h2>

        <div className="grid grid-cols-3 xl:grid-cols-5 w-full gap-1 md:px-4">
          {[...Array(4)].map((_, i) => {
            return <Skeleton key={i} className="aspect-square" />;
          })}
        </div>
      </div>
    </div>
  );
}
