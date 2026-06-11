import { buildPreviewPropsJson } from "./demoMedia";

export function cleanComponentCode(code: string): { cleaned: string; name: string } {
  let cleaned = code
    .replace(/^\/\/[^\n]*\n/, "")
    .replace(/^import\s+.+$/gm, "")
    .trim();

  const nameMatch =
    cleaned.match(/export\s+default\s+(?:async\s+)?function\s+(\w+)/) ??
    cleaned.match(/export\s+(?:async\s+)?function\s+(\w+)/) ??
    cleaned.match(/export\s+const\s+(\w+)\s*=/) ??
    cleaned.match(/export\s+default\s+(\w+)/) ??
    cleaned.match(/(?:function|const)\s+(\w+)/);
  const name = nameMatch?.[1] ?? "Component";

  cleaned = cleaned
    .replace(/export\s+default\s+(?:async\s+)?function/g, "function")
    .replace(/export\s+(?:async\s+)?function/g, "function")
    .replace(/export\s+default\s+const/g, "const")
    .replace(/export\s+const/g, "const")
    .replace(/export\s+interface/g, "interface")
    .replace(/export\s+type/g, "type")
    .replace(/export\s+enum/g, "enum")
    .replace(/export\s+default\s+(?=[\[(])/g, "")
    .replace(/^export\s+default\s+\w+\s*;?\s*$/gm, "")
    .replace(/^export\s*\{[^}]+\}\s*;?\s*$/gm, "")
    .replace(/export\s+default\s+/g, "")
    .replace(/^export\s+/gm, "");

  return { cleaned, name };
}

export function extractComponentName(code: string): string {
  const commentMatch = code.match(/^\/\/\s*(\w+)/);
  if (commentMatch) return commentMatch[1];
  return cleanComponentCode(code).name;
}

export function getPreviewPayload(code: string, componentName: string) {
  const { cleaned, name } = cleanComponentCode(code);
  return {
    script: cleaned,
    name,
    previewProps: JSON.parse(buildPreviewPropsJson()),
  };
}
