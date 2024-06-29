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
        "flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center w-full p-4 rounded-md bg-orange-50 border border-orange-200",
        className
      )}
      {...props}
    >
      <div className="flex flex-col md:flex-row gap-4 w-full items-center">
        <div className="relative size-64 md:size-12">
          <Image
            src={user.photoUrl}
            alt={`${user.displayName} image`}
            fill
            className="rounded-full"
          />
        </div>

        <div className="flex flex-col gap-1 justify-center">
          <h1 className="text-xl font-bold text-center md:text-start">
            {user.displayName}
          </h1>
          <p className="text-muted-foreground text-center md:text-start">
            {user.email}
          </p>
        </div>
      </div>

      {actions}
    </li>
  );
}
