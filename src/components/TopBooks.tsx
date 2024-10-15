import { ImageIcon } from "lucide-react";
import Link from "next/link";

export default function TopBooks() {
  return (
    <ul className="flex flex-col gap-4">
      {[...Array(4)].map((_, i) => {
        return (
          <li
            key={i}
            className="border border-border rounded-md overflow-hidden bg-accent/65 hover:bg-accent/80 transition-colors"
          >
            <Link
              href={`/dashboard/search`}
              className="flex gap-2 justify-between items-center p-2"
            >
              <div className="relative size-16 flex items-center justify-center rounded-full bg-accent">
                <ImageIcon className="size-5" />
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <h3 className="text-lg font-medium">Book Title</h3>
                <p>Author</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
