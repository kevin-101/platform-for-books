import { cn } from "@/lib/utils";

type MessagesProps = {
  messages: Message[] | undefined;
  userId: string | undefined;
  friendId: string;
};

export default function Messages({
  messages,
  userId,
  friendId,
}: MessagesProps) {
  return (
    <>
      {messages?.map((message) => {
        return (
          <div
            key={message.timestamp?.toString()}
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
            </div>
          </div>
        );
      })}
    </>
  );
}
