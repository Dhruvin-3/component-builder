"use client";

import { Archive, ArrowLeft } from "lucide-react";
import { SavedComponent } from "@/lib/types";
import ComponentCard from "./ComponentCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SavedComponentsGalleryProps {
  savedComponents: SavedComponent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export default function SavedComponentsGallery({
  savedComponents,
  selectedId,
  onSelect,
  onDelete,
  onBack,
}: SavedComponentsGalleryProps) {
  function handleSelect(id: string) {
    onSelect(id);
    onBack();
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold">Past Generated Components</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {savedComponents.length} component{savedComponents.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back to Code
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1 p-5">
        {savedComponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Archive className="size-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No saved components yet</p>
            <p className="text-muted-foreground/70 text-sm mt-1">
              Generate a component in chat to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {savedComponents.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                isSelected={component.id === selectedId}
                onSelect={handleSelect}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
