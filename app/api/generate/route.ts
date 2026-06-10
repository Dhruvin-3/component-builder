import { NextRequest, NextResponse } from "next/server";
import { generateComponentCode, extractComponentName } from "@/lib/cursor";

export const maxDuration = 180;

export async function POST(req: NextRequest) {
  try {
    const { prompt, existingCode, componentName: existingName } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required and must be a string" },
        { status: 400 }
      );
    }

    const hasExistingCode =
      typeof existingCode === "string" && existingCode.trim().length > 0;
    const hasComponentName =
      typeof existingName === "string" && existingName.trim().length > 0;

    if (hasExistingCode !== hasComponentName) {
      return NextResponse.json(
        {
          error:
            "existingCode and componentName must both be provided for refinement",
        },
        { status: 400 }
      );
    }

    const refinement =
      hasExistingCode && hasComponentName
        ? { existingCode: existingCode.trim(), componentName: existingName.trim() }
        : undefined;

    const raw = await generateComponentCode(prompt, refinement);

    const code = raw
      .replace(/^```(?:tsx|typescript|jsx|js)?\n?/m, "")
      .replace(/\n?```$/m, "")
      .trim();

    const componentName = extractComponentName(code);

    return NextResponse.json({ code, componentName });
  } catch (err) {
    console.error("[/api/generate] error:", err);

    const message =
      err instanceof Error ? err.message : "Failed to generate component.";

    if (message.includes("CURSOR_API_KEY")) {
      return NextResponse.json(
        {
          error:
            "CURSOR_API_KEY is missing. Add it to .env.local and restart the dev server.",
        },
        { status: 500 }
      );
    }

    if (message.includes("401") || message.includes("403")) {
      return NextResponse.json(
        {
          error:
            "Invalid CURSOR_API_KEY. Create one at cursor.com/dashboard/integrations.",
        },
        { status: 401 }
      );
    }

    if (message.includes("timed out")) {
      return NextResponse.json(
        { error: "Generation timed out. Try a simpler prompt or try again." },
        { status: 504 }
      );
    }

    if (
      message.includes("fetch failed") ||
      message.includes("503") ||
      message.includes("429")
    ) {
      return NextResponse.json(
        {
          error:
            "Cursor API is temporarily unavailable. Please wait a few seconds and try again.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate component. Please try again." },
      { status: 500 }
    );
  }
}
