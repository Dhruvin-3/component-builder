"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { useTheme } from "next-themes";
import { useMemo } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const lightTheme = EditorView.theme(
  {
    "&": { backgroundColor: "var(--background)", color: "var(--foreground)" },
    ".cm-gutters": {
      backgroundColor: "var(--muted)",
      color: "var(--muted-foreground)",
      border: "none",
    },
    ".cm-activeLineGutter": { backgroundColor: "var(--accent)" },
    ".cm-activeLine": { backgroundColor: "color-mix(in oklch, var(--accent) 50%, transparent)" },
  },
  { dark: false }
);

export default function CodeEditor({ value, onChange }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  const extensions = useMemo(
    () => [javascript({ jsx: true, typescript: true })],
    []
  );

  const theme = resolvedTheme === "dark" ? oneDark : lightTheme;

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={theme}
      extensions={extensions}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        bracketMatching: true,
        autocompletion: false,
      }}
      className="h-full [&_.cm-editor]:h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:font-mono [&_.cm-scroller]:text-[13px] [&_.cm-scroller]:leading-relaxed"
    />
  );
}
