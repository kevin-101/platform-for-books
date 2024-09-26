"use client";

import { CheckCircleIcon, Loader2Icon, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useAuthContext } from "./AuthProvider";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import UserListItem from "./UserListItem";
import LoadingComp from "./LoadingComp";
import { sendFriendRequest } from "@/actions/firebase-actions/sendFriendRequest";

type UserSearchResultsProps = {
  email: string | undefined;
  friendIds: string[] | undefined;
};

export default function UserSearchResults({
  email,
  friendIds,
}: UserSearchResultsProps) {
  const [user] = useAuthContext();
  const [matchingUsers, setMatchingUsers] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  useEffect(() => {
    async function searchUser(qry: string | undefined) {
      if (qry) {
        try {
          setSearchLoading(true);

          const usersRes = await fetch(`/api/users?email=${qry}&name=${qry}`);
          const users: User[] = (await usersRes.json()).data as User[];

          setMatchingUsers(users);
        } catch (error) {
          console.error(error);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setMatchingUsers([]);
      }
    }

    searchUser(email);
  }, [email]);

  async function handleSendFriendRequest(requestedUser: User) {
    const requestingUserId = user?.uid as string;

    if (requestingUserId && requestedUser) {
      // server action
      sendFriendRequest(requestingUserId, requestedUser.id);
    }
  }

  return searchLoading ? (
    <LoadingComp />
  ) : (
    <div className="flex flex-col w-full gap-2 items-center">
      {matchingUsers && matchingUsers.length > 0 ? (
        <ul className="flex flex-col w-full gap-2">
          {matchingUsers.map((user, _) => {
            return (
              <UserListItem
                key={user.id}
                user={user}
                actions={
                  <AddActions
                    sendFriendRequest={() => handleSendFriendRequest(user)}
                    isFriend={friendIds?.includes(user.id) as boolean}
                  />
                }
              />
            );
          })}
        </ul>
      ) : (
        <h1 className="text-lg font-medium text-muted-foreground text-center">
          No Matching Users Found
        </h1>
      )}
    </div>
  );
}

type AddActionsProps = {
  sendFriendRequest: () => Promise<void>;
  isFriend: boolean;
};

function AddActions({ sendFriendRequest, isFriend }: AddActionsProps) {
  const [reqSendLoading, setReqsendLoading] = useState<boolean>(false);

  async function send() {
    try {
      setReqsendLoading(true);

      await sendFriendRequest();

      toast.success("Friend Request Sent");
    } catch (error) {
      console.error(error);
      toast.error("Something Went Wrong");
    } finally {
      setReqsendLoading(false);
    }
  }

  return isFriend ? (
    <div className="flex justify-center items-center size-10 bg-green-200 border border-green-600 rounded-md">
      <CheckCircleIcon className="size-5 text-green-700" />
    </div>
  ) : (
    <Button variant="outline" size="icon" onClick={() => send()}>
      {reqSendLoading ? (
        <Loader2Icon className="h-5 w-5 animate-spin" />
      ) : (
        <Plus className="h-5 w-5" />
      )}
    </Button>
  );
}
