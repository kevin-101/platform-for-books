import Image from "next/image";

type ProfileHeaderProps = {
  user: User | undefined;
};

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4 md:gap-8 w-full px-4">
      <div className="shrink-0 relative size-20 md:size-60">
        {user?.photoUrl && (
          <Image
            src={user.photoUrl}
            alt={user.displayName + "image"}
            fill
            className="rounded-full"
          />
        )}
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
