"use client";

import { Input, InputProps } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

type SearchFieldProps = {} & InputProps;

export default function SearchField({ ...props }: SearchFieldProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    function handleSearch(searchTerm: string | null) {
      // set or delete search params
      if (searchTerm) {
        const params = new URLSearchParams(searchParams);
        if (searchTerm) {
          params.set("q", searchTerm);
        } else {
          params.delete("q");
        }
        replace(`${pathname}?${params.toString()}`);
      }
    }

    handleSearch(debouncedSearch[0]);
  }, [debouncedSearch[0]]);

  return (
    <div className="flex gap-2 w-full lg:w-3/4 xl:w-1/2 py-2">
      <Input
        {...props}
        value={localSearch as string}
        onChange={(e) => setLocalSearch(e.target.value)}
      />

      <Button
        variant="outline"
        className={cn(!localSearch && "invisible")}
        onClick={() => {
          setLocalSearch("");
          replace(pathname);
        }}
      >
        <XIcon className="size-5" />
      </Button>
    </div>
  );
}
