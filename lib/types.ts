export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface SavedComponent {
  id: string;
  prompt: string;
  componentName: string;
  code: string;
  createdAt: string;
}
