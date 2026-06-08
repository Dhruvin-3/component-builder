# Component Builder

A Next.js app that turns natural-language prompts into React components using the **Cursor Cloud Agents API**. Describe a UI in chat, get production-ready TSX on the right, preview it live, and browse past generations — all in one place.

## Features

- **Chat-driven generation** — type a prompt (e.g. “A card with image, title and description”) and receive TSX code.
- **Code panel** — syntax-highlighted output with line numbers and one-click copy.
- **Live preview** — renders generated components in a sandboxed iframe without leaving the app.
- **Saved history** — components are stored in `localStorage` so you can revisit, compare, and delete past results.
- **Shadcn UI shell** — the app itself uses [shadcn/ui](https://ui.shadcn.com) (dark theme, violet accent) for buttons, inputs, tabs, cards, and more.

## Tech stack

| Layer | Tools |
|-------|-------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui (`base-nova` style) |
| AI | Cursor Cloud Agents API (`composer-2.5`) |
| Code display | `react-syntax-highlighter` |
| Icons | `lucide-react` |

## Project structure

```
app/
  page.tsx              # Main layout + saved-component state
  layout.tsx            # Root layout (fonts, dark mode)
  globals.css           # Tailwind + shadcn theme tokens
  api/generate/route.ts # Server route — calls Cursor API

components/
  ChatSidebar.tsx       # Chat UI + prompt suggestions
  CodePanel.tsx         # Code / Preview tabs, copy, history link
  ComponentPreview.tsx  # iframe-based live preview
  SavedComponentsGallery.tsx
  ComponentCard.tsx
  MessageBubble.tsx
  ui/                   # shadcn primitives (button, input, tabs, …)

lib/
  cursor.ts             # Cursor API client + prompt builder
  preview.ts            # Transforms TSX for iframe preview
  demoMedia.ts          # Fallback demo images/videos for preview
  types.ts              # Shared TypeScript types
```

## Prerequisites

- **Node.js 18+**
- A **Cursor API key** from [cursor.com/dashboard/integrations](https://cursor.com/dashboard/integrations)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Create `.env.local` in the project root:

   ```env
   CURSOR_API_KEY=your_cursor_api_key_here
   ```

   The key is used only on the server (`app/api/generate/route.ts`) and is never exposed to the browser.

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## How to use

1. Enter a component description in the left sidebar, or click a suggestion chip.
2. Wait for the AI response — generated code appears in the right panel.
3. Switch between **Code** and **Preview** tabs to inspect or render the component.
4. Click **Copy** to copy the TSX to your clipboard.
5. Use **Past Components** to browse everything saved in this browser session (persisted via `localStorage`).

## How generation works

1. The browser sends your prompt to `POST /api/generate`.
2. The server creates a Cursor Cloud Agent run with a structured prompt (Tailwind-only TSX, named export, safe defaults for props/media).
3. The route polls until the run finishes, strips markdown fences, and extracts the component name.
4. The response `{ code, componentName }` is displayed in the UI and saved locally.

Generated components use **Tailwind CSS** (not shadcn) so they stay self-contained and easy to paste into any project.

## Adding shadcn components

The app shell is built with shadcn/ui. To add more primitives:

```bash
npx shadcn@latest add dialog dropdown-menu tooltip
```

Configuration lives in `components.json`. Theme variables are in `app/globals.css`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `CURSOR_API_KEY is missing` | Add the key to `.env.local` and restart the dev server |
| `Invalid CURSOR_API_KEY` | Create a new key at cursor.com/dashboard/integrations |
| Generation timed out | Try a simpler prompt or retry |
| Preview blank / error | Ensure the generated code uses valid TSX and string URLs for media |

## License

Private project — see repository root for license details.
