"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Code2, Loader2, Send } from "lucide-react";
import MessageBubble, { Message } from "./MessageBubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatSidebarProps {
  onCodeGenerated: (code: string, componentName: string, prompt: string) => void;
}

const PROMPT_SUGGESTIONS = [
  "A primary button with hover effect",
  "A card with image, title and description",
];

export default function ChatSidebar({ onCodeGenerated }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! Describe a React component and I'll generate the code for you. Try: \"A primary button with hover effect\" or \"A card with image, title and description\".",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: `Here's your **${data.componentName}** component! The code is displayed on the right.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      onCodeGenerated(data.code, data.componentName, trimmed);
    } catch (err) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, something went wrong: ${err instanceof Error ? err.message : "Unknown error"}.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <aside className="w-80 min-w-0 flex-shrink-0 flex flex-col h-full bg-sidebar border-r border-sidebar-border overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="size-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sidebar-foreground">Component Builder</h1>
            <p className="text-xs text-muted-foreground">Powered by Cursor AI</p>
          </div>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-3">
              <Avatar size="sm" className="mr-2 mt-0.5 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <Skeleton className="size-1.5 rounded-full" />
                <Skeleton className="size-1.5 rounded-full" />
                <Skeleton className="size-1.5 rounded-full" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <Separator />

      <form onSubmit={handleSubmit} className="px-4 py-4 overflow-hidden">
        <div className="flex flex-wrap gap-2 mb-3">
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="xs"
              disabled={isLoading}
              onClick={() => setInput(suggestion)}
              className="rounded-full border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
            >
              {suggestion}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a component…"
            disabled={isLoading}
            className="flex-1 h-10 rounded-xl px-4"
          />
          <Button
            type="submit"
            size="icon-lg"
            disabled={isLoading || !input.trim()}
            className="rounded-xl shrink-0"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </aside>
  );
}
