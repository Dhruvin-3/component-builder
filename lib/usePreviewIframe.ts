"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPreviewPayload } from "@/lib/preview";

export function usePreviewIframe(
  code: string,
  componentName: string,
  enabled = true
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [error, setError] = useState(false);

  const sendRender = useCallback(() => {
    if (!enabled) return;
    const iframe = iframeRef.current?.contentWindow;
    if (!iframe || !ready) return;

    setRendering(true);
    setError(false);
    iframe.postMessage(
      { type: "RENDER", payload: getPreviewPayload(code, componentName) },
      window.location.origin
    );
  }, [code, componentName, ready, enabled]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "PREVIEW_READY") setReady(true);
      if (event.data?.type === "PREVIEW_RENDERED") {
        setRendering(false);
        setError(false);
      }
      if (event.data?.type === "PREVIEW_ERROR") {
        setRendering(false);
        setError(true);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      setRendering(true);
      setError(false);
      return;
    }
    if (ready) sendRender();
  }, [ready, sendRender, enabled]);

  return { iframeRef, rendering, error };
}
