"use client";

import { useState, useEffect } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import RightPanel, { PanelView } from "@/components/RightPanel";
import { SavedComponent } from "@/lib/types";

const STORAGE_KEY = "component-builder-saved";

export default function Home() {
  const [savedComponents, setSavedComponents] = useState<SavedComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelView, setPanelView] = useState<PanelView>("code");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: SavedComponent[] = JSON.parse(stored);
        setSavedComponents(parsed);
        if (parsed.length > 0) setSelectedId(parsed[0].id);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (savedComponents.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedComponents));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [savedComponents]);

  function handleCodeGenerated(code: string, name: string, prompt: string) {
    const newComponent: SavedComponent = {
      id: crypto.randomUUID(),
      prompt,
      componentName: name,
      code,
      createdAt: new Date().toISOString(),
    };
    setSavedComponents((prev) => [newComponent, ...prev]);
    setSelectedId(newComponent.id);
    setPanelView("code");
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    setPanelView("code");
  }

  function handleDelete(id: string) {
    setSavedComponents((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (selectedId === id) {
        setSelectedId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  }

  return (
    <main className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar onCodeGenerated={handleCodeGenerated} />
      <RightPanel
        savedComponents={savedComponents}
        selectedId={selectedId}
        view={panelView}
        onViewChange={setPanelView}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />
    </main>
  );
}
