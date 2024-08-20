import ProfileHeader from "@/components/ProfileHeader";
import { Suspense } from "react";
import SharedBooks from "@/components/SharedBooks";
import { BooksLoading } from "../../profile/page";

type UserProfilePageProps = {
  params: {
    userId: string;
  };
};

export default async function UserProfilePage({
  params: { userId },
}: UserProfilePageProps) {
  const userRes = await fetch(
    `${process.env.APP_DOMAIN}/api/users?id=${userId}`
  );

  if (!userRes.ok) {
    throw new Error(userRes.statusText);
  }
  const user = (await userRes.json()).data as User;

  return (
    <div className="flex flex-col gap-10 md:px-4 py-4 md:py-8">
      <ProfileHeader user={user} />

      <div className="flex flex-col w-full gap-4">
        <h2 className="text-lg md:text-xl font-medium text-center md:text-start">
          Shared books
        </h2>

        <div className="grid grid-cols-3 xl:grid-cols-5 w-full gap-[2px]">
          <Suspense fallback={<BooksLoading />}>
            <SharedBooks user={user} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
