"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Archive, Check, Code2, Copy, Eye, RotateCcw } from "lucide-react";
import ComponentPreview from "@/components/ComponentPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { extractComponentName } from "@/lib/preview";
import { cn } from "@/lib/utils";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

type PanelTab = "code" | "preview" | "split";

const PREVIEW_DEBOUNCE_MS = 400;
const SAVE_DEBOUNCE_MS = 600;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

interface CodePanelProps {
  code: string;
  componentName: string;
  componentId?: string;
  prompt?: string;
  savedCount?: number;
  onViewHistory?: () => void;
  onCodeChange?: (code: string, componentName: string) => void;
}

export default function CodePanel({
  code,
  componentName,
  componentId,
  prompt,
  savedCount = 0,
  onViewHistory,
  onCodeChange,
}: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("code");
  const [editedCode, setEditedCode] = useState(code);

  const debouncedPreviewCode = useDebouncedValue(editedCode, PREVIEW_DEBOUNCE_MS);
  const previewName =
    extractComponentName(debouncedPreviewCode) || componentName || "Component";
  const isDirty = editedCode !== code;

  useEffect(() => {
    setEditedCode(code);
  }, [code, componentId]);

  useEffect(() => {
    if (!onCodeChange || editedCode === code) return;

    const timer = setTimeout(() => {
      onCodeChange(editedCode, extractComponentName(editedCode) || componentName);
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [editedCode, code, componentName, onCodeChange]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(editedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = editedCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleRevert() {
    setEditedCode(code);
  }

  function handleTabChange(value: string) {
    setActiveTab(value as PanelTab);
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

  const showPreview = activeTab === "preview" || activeTab === "split";
  const showEditor = activeTab === "code" || activeTab === "split";

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-card flex-shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="text-muted-foreground font-mono">{previewName}.tsx</span>
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                TSX
              </Badge>
              {isDirty && (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                >
                  Edited
                </Badge>
              )}
            </div>
            {prompt && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-md">{prompt}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="split">Split</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="size-3.5" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isDirty && (
            <Button type="button" variant="outline" size="sm" onClick={handleRevert}>
              <RotateCcw className="size-4" />
              Revert
            </Button>
          )}

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

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {showEditor && (
          <div
            className={cn(
              "min-h-0 overflow-hidden",
              activeTab === "split" ? "flex-1 border-b border-border" : "flex-1"
            )}
          >
            <CodeEditor value={editedCode} onChange={setEditedCode} />
          </div>
        )}

        {showPreview && (
          <div className={cn("min-h-0 overflow-hidden", activeTab === "split" ? "flex-1" : "flex-1")}>
            <ComponentPreview code={debouncedPreviewCode} componentName={previewName} />
          </div>
        )}
      </div>
    </div>
  );
}
