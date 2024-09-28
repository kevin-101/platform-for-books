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
    console.log(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4 justify-center items-center h-full w-full">
      <h1 className="text-3xl font-bold">Something went wrong!</h1>
      <p className="text-lg font-medium text-center">
        Message: {error.message}
      </p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
