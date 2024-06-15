import { CircleXIcon } from "lucide-react";

export default function ErrorComp() {
  return (
    <div className="flex flex-col gap-2 w-full h-full justify-center items-center">
      <CircleXIcon className="h-20 w-20 text-red-600" />
      <h1 className="text-3xl font-bold text-red-600">Something went wrong</h1>
    </div>
  );
}
