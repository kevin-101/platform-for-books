import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import Image from "next/image";
import { ComponentProps, ReactNode } from "react";

type UserListItemProps = ComponentProps<"li"> & {
  className?: ClassValue;
  user: User;
  actions: ReactNode;
};

export default function UserListItem({
  className,
  user,
  actions,
  ...props
}: UserListItemProps) {
  return (
    <li
      className={cn(
        "flex gap-4 md:gap-6 justify-between items-center w-full p-4 rounded-md bg-orange-50 border border-orange-200",
        className
      )}
      {...props}
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
        <h1 className="text-xl font-bold md:text-start">{user.displayName}</h1>
        <p className="text-muted-foreground md:text-start">{user.email}</p>
      </div>

      {actions}
    </li>
  );
}
