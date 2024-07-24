import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-10 items-center pt-4 md:pt-8">
      <div className="flex items-center gap-4 md:gap-8 w-full px-4">
        <Skeleton className="relative size-20 md:size-60 rounded-full" />
        <div className="flex flex-col flex-1 gap-2">
          <Skeleton className="w-[40%] h-6 md:h-8" />
          <Skeleton className="w-[70%] h-6 md:h-8" />
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-lg md:text-xl font-medium text-center md:text-start w-full px-4">
          Your books that are up for sharing
        </h2>

        <div className="grid grid-cols-3 lg:grid-cols-5 place-items-center w-full gap-[2px] md:px-4">
          {[...Array(7)].map((_, i) => {
            return (
              <Skeleton
                key={i}
                className="w-full h-32 md:h-[20vw] lg:h-[15vw] rounded-none"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
