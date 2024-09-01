"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error.message);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h1 className="text-3xl font-bold">Something went wrong!</h1>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
