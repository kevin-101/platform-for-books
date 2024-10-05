"use client";

import { useEffect } from "react";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.log(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4 justify-center items-center h-full w-full">
      <h1 className="text-3xl font-bold">Something went wrong!</h1>
      <p className="text-lg font-medium text-center">
        Please refresh or navigate to a different route
      </p>
      <p className="text-lg font-medium text-center">{error.digest}</p>
    </div>
  );
}
