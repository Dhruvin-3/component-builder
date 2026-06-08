"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getPreviewPayload } from "@/lib/preview";

interface ComponentPreviewProps {
  code: string;
  componentName: string;
}

export default function ComponentPreview({ code, componentName }: ComponentPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [rendering, setRendering] = useState(true);
  const payloadRef = useRef(getPreviewPayload(code, componentName));

  const sendRender = useCallback(() => {
    const iframe = iframeRef.current?.contentWindow;
    if (!iframe || !ready) return;

    setRendering(true);
    payloadRef.current = getPreviewPayload(code, componentName);
    iframe.postMessage(
      { type: "RENDER", payload: payloadRef.current },
      window.location.origin
    );
  }, [code, componentName, ready]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "PREVIEW_READY") {
        setReady(true);
      }
      if (event.data?.type === "PREVIEW_RENDERED" || event.data?.type === "PREVIEW_ERROR") {
        setRendering(false);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (ready) sendRender();
  }, [ready, sendRender]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {rendering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Rendering preview…
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/preview-shell.html"
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-0 bg-gray-900"
        title={`Preview of ${componentName}`}
      />
    </div>
  );
}
