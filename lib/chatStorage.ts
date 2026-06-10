import { Message, SavedComponent } from "./types";

export const CHAT_STORAGE_KEY = "component-builder-chats";
export const NEW_CHAT_KEY = "__new__";

export function getWelcomeMessage(): Message {
  return {
    role: "assistant",
    content:
      'Hi! Describe a React component and I\'ll generate the code for you. Try: "A primary button with hover effect" or "A card with image, title and description".',
  };
}

export function parsePromptChain(prompt: string): string[] {
  if (!prompt.includes(" → ")) return [prompt.trim()].filter(Boolean);
  return prompt
    .split(" → ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function seedChatFromComponent(component: SavedComponent): Message[] {
  const prompts = parsePromptChain(component.prompt);
  const messages: Message[] = [];

  prompts.forEach((prompt, index) => {
    messages.push({ role: "user", content: prompt });
    messages.push({
      role: "assistant",
      content:
        index === 0
          ? `Here's your **${component.componentName}** component! The code is displayed on the right.`
          : `Updated **${component.componentName}** with your changes. See the revised code on the right.`,
    });
  });

  return messages;
}

export function loadAllChats(): Record<string, Message[]> {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, Message[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    return {};
  }
}

export function loadChatHistory(
  key: string,
  component?: SavedComponent | null
): Message[] {
  const chats = loadAllChats();
  if (chats[key]?.length) return chats[key];

  if (key !== NEW_CHAT_KEY && component) {
    return seedChatFromComponent(component);
  }

  return [getWelcomeMessage()];
}

export function saveChatHistory(key: string, messages: Message[]): void {
  const chats = loadAllChats();
  chats[key] = messages;
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
}

export function clearChatHistory(key: string): void {
  const chats = loadAllChats();
  delete chats[key];
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
}

export function getFreshChatMessages(
  key: string,
  component?: SavedComponent | null
): Message[] {
  if (key !== NEW_CHAT_KEY && component) {
    return seedChatFromComponent(component);
  }
  return [getWelcomeMessage()];
}

export function deleteChatHistory(id: string): void {
  clearChatHistory(id);
}

export function getActiveChatKey(
  isNewComponentMode: boolean,
  selectedId: string | null
): string {
  if (isNewComponentMode || !selectedId) return NEW_CHAT_KEY;
  return selectedId;
}
