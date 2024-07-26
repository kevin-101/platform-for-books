import { cn } from "@/lib/utils";
import { CheckCheckIcon, Clock2Icon } from "lucide-react";
import { memo } from "react";

type MessagesProps = {
  messages: Message[] | undefined;
  userId: string | undefined;
  friendId: string;
};

function Messages({ messages, userId, friendId }: MessagesProps) {
  console.log("Messages rendered");

  return (
    <>
      {messages?.map((message) => {
        return (
          <div
            key={message.messageId}
            className={cn("flex w-full", {
              "justify-end": message.userId === userId,
              "justify-start": message.userId === friendId,
            })}
          >
            <div
              className={cn("rounded-md p-3 max-w-[90%] break-words", {
                "bg-orange-200": message.userId === userId,
                "bg-muted": message.userId === friendId,
              })}
            >
              <p className="w-full whitespace-pre-wrap">{message.message}</p>
              {message.timestamp ? (
                <p className="flex justify-end gap-2 w-full text-muted-foreground text-xs">
                  {message.timestamp
                    .toDate()
                    .toLocaleTimeString("en-US", { timeStyle: "short" })}
                  {message.userId === userId && (
                    <CheckCheckIcon className="size-4" />
                  )}
                </p>
              ) : (
                <span className="flex justify-end w-full text-muted-foreground text-xs">
                  <Clock2Icon className="size-2" />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default memo(Messages);
