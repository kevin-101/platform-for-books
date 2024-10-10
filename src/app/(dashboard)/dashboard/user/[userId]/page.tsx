import ProfileHeader from "@/components/ProfileHeader";
import { Suspense } from "react";
import SharedBooks from "@/components/SharedBooks";
import { cookies } from "next/headers";
import { Skeleton } from "@/components/ui/skeleton";
import { adminAuth } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";

type UserProfilePageProps = {
  params: {
    userId: string;
  };
};

export default async function UserProfilePage({
  params: { userId },
}: UserProfilePageProps) {
  const idToken = cookies().get("idToken")?.value;

  const userRes = await fetch(
    `${process.env.APP_DOMAIN}/api/users?id=${userId}`
  );

  if (!userRes.ok) {
    throw new Error(userRes.statusText);
  }
  const user = (await userRes.json()).data as User;

  const currentUserId =
    adminAuth && idToken && (await adminAuth?.verifyIdToken(idToken)).uid;

  if (currentUserId === user.id) {
    redirect("/dashboard/profile");
  }

  const friendsRes = await fetch(`${process.env.APP_DOMAIN}/api/friends`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!friendsRes.ok) {
    throw new Error(friendsRes.statusText);
  }

  const friends = (await friendsRes.json()).data as User[];
  const friendIds = friends.map((friend) => friend.id);
  const isFriend = friendIds.includes(user.id);

  return (
    <div className="flex flex-col gap-10 py-4 md:py-8">
      <ProfileHeader user={user} isFriend={isFriend} />

      <Suspense fallback={<BooksLoading />}>
        <SharedBooks user={user} />
      </Suspense>
    </div>
  );
}

function BooksLoading() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-lg md:text-xl font-medium text-center w-full px-4">
        Shared Books
      </h2>

      <div className="grid grid-cols-3 xl:grid-cols-5 w-full gap-1 md:px-4">
        {[...Array(4)].map((_, i) => {
          return <Skeleton key={i} className="aspect-square" />;
        })}
      </div>
    </div>
  );
}
