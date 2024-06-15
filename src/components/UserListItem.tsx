import Image from "next/image";
import { ComponentProps, ReactNode } from "react";

type UserListItemProps = ComponentProps<"li"> & {
  user: User;
  actions: ReactNode;
};

export default function UserListItem({
  user,
  actions,
  ...props
}: UserListItemProps) {
  return (
    <li
      {...props}
      className="flex justify-between items-center w-full p-4 rounded-md bg-orange-50 border border-orange-200"
    >
      <div className="flex gap-4 items-center">
        <div className="relative h-12 w-12">
          <Image
            src={user.photoUrl}
            alt={`${user.displayName} image`}
            fill
            className="rounded-full"
          />
        </div>

        <div className="flex flex-col gap-1 justify-center">
          <h1 className="text-xl font-bold">{user.displayName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {actions}
    </li>
  );
}
