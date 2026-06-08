"use client";

import { SavedComponent } from "@/lib/types";
import CodePanel from "./CodePanel";
import SavedComponentsGallery from "./SavedComponentsGallery";

export type PanelView = "code" | "history";

interface RightPanelProps {
  savedComponents: SavedComponent[];
  selectedId: string | null;
  view: PanelView;
  onViewChange: (view: PanelView) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function RightPanel({
  savedComponents,
  selectedId,
  view,
  onViewChange,
  onSelect,
  onDelete,
}: RightPanelProps) {
  const selected = savedComponents.find((c) => c.id === selectedId);

  if (view === "history") {
    return (
      <SavedComponentsGallery
        savedComponents={savedComponents}
        selectedId={selectedId}
        onSelect={onSelect}
        onDelete={onDelete}
        onBack={() => onViewChange("code")}
      />
    );
  }

  return (
    <CodePanel
      code={selected?.code ?? ""}
      componentName={selected?.componentName ?? ""}
      prompt={selected?.prompt}
      savedCount={savedComponents.length}
      onViewHistory={() => onViewChange("history")}
    />
  );
}
