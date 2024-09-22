import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

type UserListItemProps = {
  className?: ClassValue;
  user: User;
  actions: ReactNode;
};

export default function UserListItem({
  className,
  user,
  actions,
}: UserListItemProps) {
  return (
    <li
      className={cn(
        "flex gap-4 md:gap-6 justify-between items-center w-full rounded-md bg-accent/60 hover:bg-accent/80 transition-colors border border-border",
        className
      )}
    >
      <Link
        href={`/dashboard/user/${user.id}`}
        className="w-full flex gap-4 md:gap-6 items-center p-4 truncate"
      >
        <div className="shrink-0 relative size-12">
          <Image
            src={user.photoUrl}
            alt={`${user.displayName} image`}
            fill
            className="rounded-full"
          />
        </div>

        <div className="flex flex-col flex-1 gap-1 overflow-hidden *:truncate">
          <h1 className="text-xl font-bold md:text-start">
            {user.displayName}
          </h1>
          <p className="text-muted-foreground md:text-start">{user.email}</p>
        </div>
      </Link>

      <div className="p-4">{actions}</div>
    </li>
  );
}
