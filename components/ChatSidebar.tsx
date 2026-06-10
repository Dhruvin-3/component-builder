"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Code2, Loader2, Pencil, Plus, Send, Trash2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ThemeToggle from "@/components/theme-toggle";
import {
  clearChatHistory,
  getActiveChatKey,
  getFreshChatMessages,
  getWelcomeMessage,
  loadChatHistory,
  NEW_CHAT_KEY,
  saveChatHistory,
} from "@/lib/chatStorage";
import { Message, SavedComponent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  selectedComponent: SavedComponent | null;
  selectedId: string | null;
  onCodeGenerated: (
    code: string,
    componentName: string,
    prompt: string,
    updateId?: string
  ) => string;
}

const PROMPT_SUGGESTIONS = [
  "A primary button with hover effect",
  "A card with image, title and description",
];

const REFINEMENT_SUGGESTIONS = [
  "Make it wider with more padding",
  "Add a hover animation",
  "Use a dark color variant",
];

export default function ChatSidebar({
  selectedComponent,
  selectedId,
  onCodeGenerated,
}: ChatSidebarProps) {
  const [isNewComponentMode, setIsNewComponentMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeChatKeyRef = useRef(getActiveChatKey(false, null));
  const messagesRef = useRef(messages);
  const skipNextLoadRef = useRef(false);
  const prevSelectedIdRef = useRef(selectedId);

  messagesRef.current = messages;

  const activeChatKey = getActiveChatKey(isNewComponentMode, selectedId);
  const isRefinementMode = Boolean(selectedComponent?.code) && !isNewComponentMode;

  useEffect(() => {
    if (prevSelectedIdRef.current !== selectedId) {
      prevSelectedIdRef.current = selectedId;
      setIsNewComponentMode(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      activeChatKeyRef.current = activeChatKey;
      return;
    }

    if (activeChatKeyRef.current === activeChatKey) return;

    saveChatHistory(activeChatKeyRef.current, messagesRef.current);
    activeChatKeyRef.current = activeChatKey;
    setMessages(
      loadChatHistory(
        activeChatKey,
        activeChatKey === selectedId ? selectedComponent : null
      )
    );
  }, [activeChatKey, selectedId, selectedComponent]);

  useEffect(() => {
    saveChatHistory(activeChatKey, messages);
  }, [messages, activeChatKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function switchToNewMode() {
    setIsNewComponentMode(true);
    setInput("");
  }

  function switchToRefineMode() {
    setIsNewComponentMode(false);
    setInput("");
  }

  function handleClearChat() {
    if (isLoading) return;
    if (!window.confirm("Clear this chat? Saved component code won't be affected.")) return;

    clearChatHistory(activeChatKey);
    const fresh = getFreshChatMessages(
      activeChatKey,
      activeChatKey === selectedId ? selectedComponent : null
    );
    setMessages(fresh);
    setInput("");
  }

  const canClearChat = messages.some((m) => m.role === "user");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const messagesWithUser = [...messages, userMessage];
    setMessages(messagesWithUser);
    setInput("");
    setIsLoading(true);

    try {
      const body: Record<string, string> = { prompt: trimmed };
      if (isRefinementMode && selectedComponent) {
        body.existingCode = selectedComponent.code;
        body.componentName = selectedComponent.componentName;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: isRefinementMode
          ? `Updated **${data.componentName}** with your changes. See the revised code on the right.`
          : `Here's your **${data.componentName}** component! The code is displayed on the right.`,
      };
      const finalMessages = [...messagesWithUser, assistantMessage];

      const componentId = onCodeGenerated(
        data.code,
        data.componentName,
        trimmed,
        isRefinementMode ? selectedComponent!.id : undefined
      );

      if (isRefinementMode) {
        setMessages(finalMessages);
      } else {
        saveChatHistory(componentId, finalMessages);
        saveChatHistory(NEW_CHAT_KEY, [getWelcomeMessage()]);
        skipNextLoadRef.current = true;
        activeChatKeyRef.current = componentId;
        setIsNewComponentMode(false);
        setMessages(finalMessages);
      }
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Code2 className="size-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-sidebar-foreground truncate">
                Component Builder
              </h1>
              <p className="text-xs text-muted-foreground">Powered by Cursor AI</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <Separator />

      {selectedComponent && (
        <div
          className={cn(
            "px-4 py-2.5 border-b",
            isNewComponentMode
              ? "bg-muted/50 border-border"
              : "bg-primary/5 border-primary/20"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isNewComponentMode ? (
              <Plus className="size-3.5 text-muted-foreground shrink-0" />
            ) : (
              <Pencil className="size-3.5 text-primary shrink-0" />
            )}
            <p className="text-xs text-muted-foreground truncate min-w-0">
              {isNewComponentMode ? (
                "Creating new component"
              ) : (
                <>
                  Editing{" "}
                  <span className="font-medium text-foreground">
                    {selectedComponent.componentName}
                  </span>
                </>
              )}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "ml-auto shrink-0 text-[10px] px-1.5 py-0",
                isNewComponentMode
                  ? "border-border bg-muted text-muted-foreground"
                  : "border-primary/30 bg-primary/10 text-primary"
              )}
            >
              {isNewComponentMode ? "New" : "Refine"}
            </Badge>
          </div>
          <div className="flex gap-1.5 mt-2">
            <Button
              type="button"
              variant={isNewComponentMode ? "secondary" : "outline"}
              size="xs"
              onClick={switchToNewMode}
              className="flex-1 h-7 text-xs"
            >
              <Plus className="size-3" />
              New component
            </Button>
            <Button
              type="button"
              variant={!isNewComponentMode ? "secondary" : "outline"}
              size="xs"
              onClick={switchToRefineMode}
              className="flex-1 h-7 text-xs"
            >
              <Pencil className="size-3" />
              Refine
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <span className="text-xs font-medium text-muted-foreground">Chat</span>
        {canClearChat && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={isLoading}
            onClick={handleClearChat}
            className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3" />
            Clear chat
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
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
          {(isRefinementMode ? REFINEMENT_SUGGESTIONS : PROMPT_SUGGESTIONS).map(
            (suggestion) => (
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
            )
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRefinementMode
                ? `Refine ${selectedComponent!.componentName}…`
                : "Describe a component…"
            }
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
