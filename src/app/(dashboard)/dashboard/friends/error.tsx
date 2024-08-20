"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <h1 className="text-3xl font-bold">Something went wrong!</h1>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
