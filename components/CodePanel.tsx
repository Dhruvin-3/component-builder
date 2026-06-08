"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { CSSProperties } from "react";
import { Archive, Check, Code2, Copy, Eye } from "lucide-react";
import ComponentPreview from "@/components/ComponentPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type PanelTab = "code" | "preview";

const codeTheme = Object.fromEntries(
  Object.entries(oneDark).map(([key, value]) => [
    key,
    {
      ...(value as CSSProperties),
      fontStyle: "normal",
      ...(key === "comment" && { color: "#abb2bf" }),
    },
  ])
);

interface CodePanelProps {
  code: string;
  componentName: string;
  prompt?: string;
  savedCount?: number;
  onViewHistory?: () => void;
}

export default function CodePanel({
  code,
  componentName,
  prompt,
  savedCount = 0,
  onViewHistory,
}: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("code");
  const [previewMounted, setPreviewMounted] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleTabChange(value: string) {
    const tab = value as PanelTab;
    if (tab === "preview") setPreviewMounted(true);
    setActiveTab(tab);
  }

  if (!code) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
            <Code2 className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">No component yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Describe a component in chat to generate code
            </p>
            {savedCount > 0 && onViewHistory && (
              <Button
                type="button"
                variant="outline"
                className="mt-4 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                onClick={onViewHistory}
              >
                View Past Components ({savedCount})
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-card flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-1.5">
            <span className="size-3 rounded-full bg-red-500/70" />
            <span className="size-3 rounded-full bg-yellow-500/70" />
            <span className="size-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-mono">{componentName}.tsx</span>
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                TSX
              </Badge>
            </div>
            {prompt && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-md">{prompt}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="size-3.5" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {onViewHistory && savedCount > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={onViewHistory}>
              <Archive className="size-4" />
              Past Components
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {savedCount}
              </Badge>
            </Button>
          )}

          <Button
            type="button"
            variant={copied ? "secondary" : "outline"}
            size="sm"
            onClick={handleCopy}
            className={cn(
              copied && "border-green-600/30 bg-green-600/20 text-green-400 hover:bg-green-600/20"
            )}
          >
            {copied ? (
              <>
                <Check className="size-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      <div className={cn("flex-1 overflow-auto code-panel", activeTab !== "code" && "hidden")}>
        <SyntaxHighlighter
          language="tsx"
          style={codeTheme}
          showLineNumbers
          wrapLongLines
          codeTagProps={{ className: "code-highlighter" }}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: "var(--background)",
            fontSize: "13px",
            lineHeight: "1.6",
            minHeight: "100%",
          }}
          lineNumberStyle={{
            color: "var(--muted-foreground)",
            paddingRight: "1.5em",
            minWidth: "2.5em",
            opacity: 0.5,
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {previewMounted && (
        <div className={cn("flex-1 overflow-hidden", activeTab !== "preview" && "hidden")}>
          <ComponentPreview code={code} componentName={componentName} />
        </div>
      )}
    </div>
  );
}
