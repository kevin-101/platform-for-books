import { UserIcon } from "lucide-react";
import Link from "next/link";

export default function FriendBooks() {
  return (
    <ul className="flex flex-col gap-4">
      {[...Array(4)].map((_, i) => {
        return (
          <li
            key={i}
            className="border border-border rounded-md overflow-hidden bg-accent/65 hover:bg-accent/80 transition-colors"
          >
            <Link
              href={`/dashboard/friends`}
              className="flex gap-2 justify-between items-center p-2"
            >
              <div className="relative shrink-0 size-16 flex items-center justify-center rounded-full bg-accent">
                <UserIcon className="size-5" />
              </div>

              <div className="flex flex-col gap-1 flex-1 overflow-hidden *:truncate">
                <h3 className="text-lg font-medium">Friend Name</h3>
                <p>Book Title</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
