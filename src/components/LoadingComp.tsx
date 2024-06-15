import { Loader2Icon } from "lucide-react";

export default function LoadingComp() {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <Loader2Icon className="h-16 w-16 animate-spin" />
    </div>
  );
}
