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
    <div className="flex flex-col justify-center items-center gap-4 h-full">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-lg font-medium text-center">{error.digest}</p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
