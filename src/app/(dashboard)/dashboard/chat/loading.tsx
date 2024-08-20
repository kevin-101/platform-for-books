import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex flex-col items-center">
      {[...Array(5)].map((_, i) => {
        return (
          <div
            key={i}
            className="w-full flex justify-start gap-3 px-4 lg:px-6 py-4"
          >
            <Skeleton className="rounded-full size-16 shrink-0" />

            <div className="flex flex-col flex-1 gap-1 justify-center w-full">
              <Skeleton className="w-1/2 h-5" />
              <Skeleton className="w-1/3 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
