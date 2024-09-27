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
    <div className="flex flex-col gap-10 items-center py-4 md:py-8">
      <ProfileHeader isProfile user={user} />

      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-lg md:text-xl font-medium text-center md:text-start w-full px-4">
          Your shared books
        </h2>

        <div className="grid grid-cols-3 xl:grid-cols-5 w-full gap-1 md:px-4">
          <AddBookButton className="aspect-square rounded-md" />

          <Suspense fallback={<BooksLoading />}>
            <SharedBooks user={user} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function BooksLoading() {
  return [...Array(3)].map((_, i) => {
    return <Skeleton key={i} className="aspect-square" />;
  });
}
