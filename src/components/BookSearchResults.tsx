import { MessageCircleIcon, UserIcon } from "lucide-react";
import UserListItem from "./UserListItem";
import { Button } from "./ui/button";
import { formatChatId } from "@/lib/utils";
import Link from "next/link";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

type BookSearchResultsProps = {
  searchTerm: string | undefined;
};

export default async function BookSearchResults({
  searchTerm,
}: BookSearchResultsProps) {
  const idToken = cookies().get("idToken")?.value;
  const userId: string | undefined =
    idToken && (await adminAuth?.verifyIdToken(idToken))?.uid;

  let queryResults: { bookName: string; users: User[] }[] | undefined;

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
    queryResults = (await userRes.json()).data as {
      bookName: string;
      users: User[];
    }[];
  } else {
    queryResults = [];
  }

  return (
    <div className="flex flex-col gap-8 w-full items-center">
      {queryResults && queryResults.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue={queryResults[0].bookName}
        >
          {queryResults.map((result) => {
            return (
              <AccordionItem key={result.bookName} value={result.bookName}>
                <AccordionTrigger>{result.bookName}</AccordionTrigger>
                <AccordionContent>
                  <ul>
                    {result.users.map((user) => (
                      <UserListItem
                        key={user.id}
                        user={user}
                        actions={<Actions friendId={user.id} userId={userId} />}
                      />
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
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
    <Button size="icon" asChild>
      <Link href={`/dashboard/chat/${formatChatId([userId, friendId])}`}>
        <MessageCircleIcon className="size-5" />
      </Link>
    </Button>
  );
}
