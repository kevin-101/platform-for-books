"use client";

import { Input, InputProps } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

type SearchFieldProps = {} & InputProps;

export default function SearchField({ ...props }: SearchFieldProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useDebouncedCallback((searchTerm: string) => {
    // set or delete search params
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 600);

  return (
    <div className="flex gap-2 w-full lg:w-3/4 xl:w-1/2 py-2">
      <Input
        {...props}
        ref={inputRef}
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <Button
        variant="outline"
        className={cn(!searchParams.get("q") && "invisible")}
        onClick={() => {
          if (inputRef.current?.value) {
            inputRef.current.value = "";
            replace(pathname);
          }
        }}
      >
        <XIcon className="size-5" />
      </Button>
    </div>
  );
}
