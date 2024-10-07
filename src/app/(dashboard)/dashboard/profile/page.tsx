import { Suspense } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import { cookies } from "next/headers";
import { Skeleton } from "@/components/ui/skeleton";
import SharedBooks from "@/components/SharedBooks";
import dynamic from "next/dynamic";

const AddBookButton = dynamic(() => import("@/components/AddBookButton"), {
  ssr: false,
});

export default async function ProfilePage() {
  const idToken = cookies().get("idToken")?.value;

  const userRes = await fetch(`${process.env.APP_DOMAIN}/api/users`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!userRes.ok) {
    throw new Error(userRes.statusText);
  }
  const user = (await userRes.json()).data as User;

  return (
    <div className="flex flex-col gap-10 items-center pt-4 md:pt-8 pb-20 md:pb-24">
      <ProfileHeader isProfile user={user} />

      <Suspense fallback={<BooksLoading />}>
        <SharedBooks user={user} />
      </Suspense>

      <AddBookButton className="fixed bottom-4 right-6 p-2 rounded-md" />
    </div>
  );
}

function BooksLoading() {
  return [...Array(3)].map((_, i) => {
    return <Skeleton key={i} className="aspect-square" />;
  });
}
