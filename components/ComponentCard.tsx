import { X } from "lucide-react";
import { SavedComponent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ComponentCardProps {
  component: SavedComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ComponentCard({
  component,
  isSelected,
  onSelect,
  onDelete,
}: ComponentCardProps) {
  const date = new Date(component.createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(component.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(component.id);
      }}
      className={cn(
        "group relative cursor-pointer transition-all py-4",
        isSelected && "ring-2 ring-primary/50 border-primary/50 bg-primary/10"
      )}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-2 pr-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{component.componentName}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {component.prompt}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">{date}</p>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary shrink-0">
            TSX
          </Badge>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(component.id);
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Delete component"
        >
          <X className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
