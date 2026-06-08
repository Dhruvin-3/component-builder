---
name: component-builder-nextjs
description: Expert Next.js development for the Component Builder app — chat sidebar, saved component cards, Gemini/Cursor SDK API routes, and TSX code generation. Use when building, extending, or debugging the component-builder project, Next.js App Router features, AI code generation, or saved component gallery.
---

# Component Builder — Expert Next.js

Act as a senior Next.js developer. Ship minimal, production-quality diffs that match existing patterns.

## App layout

```
ChatSidebar (left)  →  RightPanel (right)
                           ├── SavedComponents gallery (cards)
                           └── CodePanel (syntax highlight + copy)
```

State lives in `app/page.tsx`. Components receive data via props/callbacks — no prop drilling beyond one level.

## File map

| Path | Role |
|------|------|
| `app/page.tsx` | Root state: `savedComponents`, `selectedId`, localStorage sync |
| `components/ChatSidebar.tsx` | Chat UI, calls `/api/generate` |
| `components/RightPanel.tsx` | Gallery + code viewer wrapper |
| `components/ComponentCard.tsx` | Single saved component card |
| `components/CodePanel.tsx` | Syntax-highlighted code + copy button |
| `components/MessageBubble.tsx` | Chat message bubble |
| `app/api/generate/route.ts` | Server-only AI generation |
| `lib/gemini.ts` | Prompt builder, retry logic, model fallback |
| `lib/types.ts` | `SavedComponent` interface |

## Next.js rules

- `"use client"` only on interactive components — never on API routes or `lib/`.
- API keys (`GEMINI_API_KEY`, `CURSOR_API_KEY`) stay in `.env.local`; never pass to the browser.
- All AI calls go through `app/api/generate/route.ts`.
- Use `NextRequest` / `NextResponse` in route handlers.
- Prefer App Router conventions: no `pages/`, no `getServerSideProps`.

## Adding a new feature — checklist

```
- [ ] Identify which layer owns state (page.tsx vs component)
- [ ] Keep API calls server-side
- [ ] Update lib/types.ts if data shape changes
- [ ] Match dark Tailwind theme (gray-900/950, violet-600 accents)
- [ ] Prevent horizontal overflow (break-words, min-w-0, overflow-x-hidden)
- [ ] Return user-friendly errors — no raw API URLs in chat
- [ ] Run tsc --noEmit before finishing
```

## Saved components pattern

```typescript
interface SavedComponent {
  id: string;
  prompt: string;
  componentName: string;
  code: string;
  createdAt: string;
}
```

- Auto-save on successful generation in `handleCodeGenerated`.
- Persist to `localStorage` key `component-builder-saved`.
- Newest card first; auto-select after generate.
- Click card → show code below; hover → delete.

## AI generation pattern

```typescript
// lib/gemini.ts — retry + model fallback
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
// 3 retries per model, 2s backoff for 503/429/fetch failed

// app/api/generate/route.ts — response shape
return NextResponse.json({ code, componentName });
```

Prompt rules (enforced in `buildPrompt`):
- TSX + Tailwind only, named export, first line `// ComponentName`
- Strip markdown fences before returning code

## UI standards

- Sidebar width: `w-80`, `overflow-x-hidden`
- Send button: disabled when `!input.trim()` or `isLoading`
- Loading: bouncing dots in chat, spinner on send button
- Code panel: `react-syntax-highlighter` with `oneDark`, line numbers
- Copy button: clipboard + 2s "Copied!" feedback

## Code quality

```typescript
// ✅ Callback passes full context
onCodeGenerated(code: string, componentName: string, prompt: string)

// ✅ Controlled input with trim guard
disabled={isLoading || !input.trim()}

// ✅ Friendly API errors
{ error: "Gemini API is temporarily unavailable. Please try again." }

// ❌ Never expose keys or dump raw fetch errors to chat
```

## Anti-patterns

- Calling Gemini/Cursor SDK from client components
- Nested `<button>` inside `<button>` (use `div role="button"` + separate delete button)
- Uncontrolled inputs without syncing React state
- Adding dependencies without checking bundle impact
- Over-abstracting — keep helpers in `lib/`, UI in `components/`

## Extending the gallery

When adding card fields (tags, favorites, export):
1. Extend `SavedComponent` in `lib/types.ts`
2. Update `ComponentCard.tsx` display
3. Migrate localStorage reads with safe defaults for missing fields
4. Keep grid scrollable: `max-h-48 overflow-y-auto`

## Additional reference

For Cursor SDK migration and API route details, see [reference.md](reference.md).
