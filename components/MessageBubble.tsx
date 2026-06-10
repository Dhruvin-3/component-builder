import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex min-w-0 mb-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar size="sm" className="mr-2 mt-0.5 bg-primary">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            AI
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] min-w-0 px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words overflow-hidden",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        {message.content}
      </div>
      {isUser && (
        <Avatar size="sm" className="ml-2 mt-0.5">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">
            U
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
