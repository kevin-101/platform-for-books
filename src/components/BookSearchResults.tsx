import { MessageCircleIcon, UserIcon } from "lucide-react";
import UserListItem from "./UserListItem";
import { Button } from "./ui/button";
import { formatChatId } from "@/lib/utils";
import Link from "next/link";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

type BookSearchResultsProps = {
  searchTerm: string | undefined;
};

export default async function BookSearchResults({
  searchTerm,
}: BookSearchResultsProps) {
  const idToken = cookies().get("idToken")?.value;
  const userId: string | undefined =
    idToken && (await adminAuth?.verifyIdToken(idToken))?.uid;

  let queryResults: User[] | undefined;

  if (searchTerm) {
    const userRes = await fetch(
      `${process.env.APP_DOMAIN}/api/books?query=${searchTerm}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!userRes.ok) {
      throw new Error(userRes.statusText);
    }
    queryResults = (await userRes.json()).data as User[];
  } else {
    queryResults = [];
  }

  // TODO: Categorize the returned users by book
  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {queryResults && queryResults.length > 0 ? (
        queryResults.map((friend) => {
          return (
            <UserListItem
              key={friend.id}
              user={friend}
              actions={<Actions friendId={friend.id} userId={userId} />}
            />
          );
        })
      ) : (
        <p className="text-lg font-medium text-muted-foreground w-full text-center">
          No results
        </p>
      )}
    </div>
  );
}

type ActionsProps = {
  friendId: string | undefined;
  userId: string | undefined;
};

function Actions({ friendId, userId }: ActionsProps) {
  return (
    <div className="flex gap-2 md:gap-4">
      <Button size="icon" asChild>
        <Link href={`/dashboard/chat/${formatChatId([userId, friendId])}`}>
          <MessageCircleIcon className="size-5" />
        </Link>
      </Button>

      <Button variant="outline" size="icon" asChild>
        <Link href={`/dashboard/user/${friendId}`}>
          <UserIcon className="size-5" />
        </Link>
      </Button>
    </div>
  );
}
