import Image from "next/image";

type ProfileHeaderProps = {
  user: User | undefined;
};

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4 md:gap-8 w-full px-4">
      <div className="shrink-0 relative size-[5.5rem] md:size-[15.5rem] rounded-full border-2 border-primary">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 md:size-60 rounded-full">
          {user?.photoUrl && (
            <Image
              src={user.photoUrl}
              alt={user.displayName + "image"}
              fill
              className="rounded-full"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-2 overflow-hidden *:truncate">
        <h1 className="text-xl md:text-3xl font-bold">{user?.displayName}</h1>
        <p className="text-lg md:text-xl font-medium text-muted-foreground">
          {user?.email}
        </p>
      </div>
    </div>
  );
}
