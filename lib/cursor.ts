const CURSOR_API_BASE = "https://api.cursor.com";
const TERMINAL_STATUSES = new Set(["FINISHED", "ERROR", "CANCELLED", "EXPIRED"]);
const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 180_000;

function getApiKey(): string {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("CURSOR_API_KEY is not set in environment variables.");
  }
  return apiKey;
}

async function cursorFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CURSOR_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cursor API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export function buildPrompt(userMessage: string): string {
  return `You are an expert React component generator.

Rules:
- Return ONLY valid TSX code, no markdown fences, no explanations, no comments outside the code.
- Use Tailwind CSS for all styling.
- The component must be a named export (e.g. export function Button(...)).
- The first line of the code must be the component name as a comment like: // ComponentName
- Keep it clean, modern, and production-ready.
- Do not use any tools or edit files — reply with code only.
- Every prop must have a default value so the component renders without arguments.
- For image grids/cards, default to 3–4 demo images using https://picsum.photos/seed/{name}/600/400 URLs.
- For video components, default to demo MP4 URLs (e.g. https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4) with poster thumbnails.
- Never call .map() on a prop without a default array fallback (use images = [] or images?.map).
- For <img> and <video>, always set src to a string URL (use item.src or item.url), never pass the whole item object as src.

User request: ${userMessage}`;
}

interface CreateAgentResponse {
  agent: { id: string };
  run: { id: string; status: string };
}

interface RunResponse {
  status: string;
  result?: string;
}

async function waitForRun(agentId: string, runId: string): Promise<RunResponse> {
  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    const run = await cursorFetch<RunResponse>(
      `/v1/agents/${agentId}/runs/${runId}`
    );

    if (TERMINAL_STATUSES.has(run.status)) return run;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Cursor agent run timed out");
}

export async function generateComponentCode(prompt: string): Promise<string> {
  const { agent, run } = await cursorFetch<CreateAgentResponse>("/v1/agents", {
    method: "POST",
    body: JSON.stringify({
      prompt: { text: buildPrompt(prompt) },
      model: { id: "composer-2.5" },
      name: `Component: ${prompt.slice(0, 80)}`,
    }),
  });

  const completed = await waitForRun(agent.id, run.id);

  if (completed.status === "ERROR") {
    throw new Error("Cursor agent run failed");
  }

  if (!completed.result?.trim()) {
    throw new Error("Cursor agent returned empty response");
  }

  return completed.result;
}

export function extractComponentName(code: string): string {
  const commentMatch = code.match(/^\/\/\s*(\w+)/);
  if (commentMatch) return commentMatch[1];

  const exportMatch = code.match(/export\s+(?:default\s+)?function\s+(\w+)/);
  if (exportMatch) return exportMatch[1];

  return "Component";
}
