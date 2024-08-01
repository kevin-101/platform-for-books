import BookSearchResults from "@/components/BookSearchResults";
import SearchField from "@/components/SearchField";

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

      <BookSearchResults searchTerm={query} />
    </div>
  );
}
