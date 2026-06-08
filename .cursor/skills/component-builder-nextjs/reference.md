# Component Builder — Reference

## API route template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateComponentCode, extractComponentName } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const raw = await generateComponentCode(prompt);
    const code = raw
      .replace(/^```(?:tsx|typescript|jsx|js)?\n?/m, "")
      .replace(/\n?```$/m, "")
      .trim();

    return NextResponse.json({
      code,
      componentName: extractComponentName(code),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    // Map to short user-facing errors — see route.ts for full mapping
    return NextResponse.json({ error: "Failed to generate component." }, { status: 500 });
  }
}
```

## Cursor SDK migration (future)

Replace `generateComponentCode` in `lib/gemini.ts` with:

```typescript
import { Agent } from "@cursor/sdk";

const result = await Agent.prompt(buildPrompt(userMessage), {
  apiKey: process.env.CURSOR_API_KEY!,
  model: { id: "composer-2.5" },
  local: { cwd: process.cwd() },
});
```

Keep the same `{ code, componentName }` response contract so UI components need no changes.

## Error mapping

| Server error | User message |
|---|---|
| Missing `GEMINI_API_KEY` | Add key to `.env.local` and restart dev server |
| 404 / model not found | Model retired — update `MODELS` in `lib/gemini.ts` |
| Invalid API key | Get new key at aistudio.google.com |
| 503 / 429 / fetch failed | Temporarily unavailable — try again |

## localStorage migration

When changing `SavedComponent` shape:

```typescript
const parsed = JSON.parse(stored) as SavedComponent[];
const migrated = parsed.map((c) => ({
  ...c,
  newField: c.newField ?? defaultValue,
}));
```

## Component file naming

| New UI piece | File |
|---|---|
| Gallery section | `components/RightPanel.tsx` or `components/SavedComponentsGallery.tsx` |
| Card item | `components/ComponentCard.tsx` |
| Shared types | `lib/types.ts` |
| AI helpers | `lib/gemini.ts` |
