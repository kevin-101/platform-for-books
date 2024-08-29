import BookSearchResults from "@/components/BookSearchResults";
import LoadingComp from "@/components/LoadingComp";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const SearchField = dynamic(() => import("@/components/SearchField"), {
  loading: () => (
    <div className="flex gap-2 w-full lg:w-3/4 xl:w-1/2 py-2">
      <Skeleton className="w-full h-10" />
      <div className="invisible h-10 w-16" />
    </div>
  ),
});

type SearchPageProps = {
  searchParams?: {
    q?: string;
  };
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.q || "";

  return (
    <div className="flex flex-col gap-6 p-4 pt-8 bg-background">
      <div className="flex flex-col w-full gap-4 justify-start">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-lg font-medium">
          Find and Chat with users with books you are looking for
        </p>
      </div>

      <div className="w-full bg-background sticky top-11 lg:top-0 z-40">
        <SearchField type="text" placeholder="Search for books" />
      </div>

      <Suspense key={query} fallback={<LoadingComp />}>
        <BookSearchResults searchTerm={query} />
      </Suspense>
    </div>
  );
}
