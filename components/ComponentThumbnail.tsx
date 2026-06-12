"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Eye } from "lucide-react";
import { usePreviewIframe } from "@/lib/usePreviewIframe";
import { cn } from "@/lib/utils";

const IFRAME_WIDTH = 520;
const IFRAME_HEIGHT = 325;

interface ComponentThumbnailProps {
  code: string;
  componentName: string;
  className?: string;
}

export default function ComponentThumbnail({
  code,
  componentName,
  className,
}: ComponentThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function updateScale() {
      const width = el!.clientWidth;
      if (width > 0) setScale(width / IFRAME_WIDTH);
    }

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { iframeRef, rendering, error } = usePreviewIframe(
    code,
    componentName,
    inView
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-[16/10] overflow-hidden bg-[#111827] border-b border-border",
        className
      )}
    >
      {!inView ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Eye className="size-5 text-muted-foreground/40" />
        </div>
      ) : (
        <>
          {rendering && !error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#111827]/80">
              <div className="size-4 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#111827]">
              <AlertCircle className="size-5 text-red-400/70" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            src="/preview-shell.html"
            sandbox="allow-scripts allow-same-origin"
            title={`Thumbnail of ${componentName}`}
            className="absolute top-0 left-0 border-0 pointer-events-none"
            style={{
              width: IFRAME_WIDTH,
              height: IFRAME_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        </>
      )}
    </div>
  );
}
