"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, MoreHorizontal } from "lucide-react";
import type { Node } from "@xyflow/react";

interface PaletteCategory {
  id: string;
  title: string;
  items: Array<{ label: string; type?: Node["type"] }>;
}

interface PaletteProps {
  categories: PaletteCategory[];
  onDragStart: (item: { label: string; type?: Node["type"] }) => (e: React.DragEvent) => void;
}

export function Palette({ categories, onDragStart }: PaletteProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    input: true,
    pre: true,
    feature: true,
    models: true,
    eval: true,
    visual: true,
    monitor: true,
    deploy: true,
    orchestrate: true,
    nlp: false,
    cv: false,
    utils: false,
  });
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => i.label.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, query]);

  const totalCount = useMemo(() => categories.reduce((acc, c) => acc + c.items.length, 0), [categories]);
  const visibleCount = useMemo(() => filtered.reduce((acc, c) => acc + c.items.length, 0), [filtered]);

  // Expand all sections while searching
  useEffect(() => {
    if (query.trim().length > 0) {
      const allOpen: Record<string, boolean> = {};
      categories.forEach((c) => (allOpen[c.id] = true));
      setOpen((prev) => ({ ...prev, ...allOpen }));
    }
  }, [query, categories]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${totalCount} nodes…`}
          className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-6 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {query && (
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded px-1 text-[10px] text-muted-foreground hover:text-foreground"
            onClick={() => setQuery("")}
          >
            Clear
          </button>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground">{visibleCount} results</div>
      <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
        {filtered.length === 0 && (
          <div className="text-center text-xs text-muted-foreground">No matching nodes</div>
        )}
        {filtered.map((cat) => (
          <div key={cat.id} className="rounded-md border border-border">
            <button
              className="flex w-full items-center justify-between px-2 py-1.5 text-left text-xs font-medium"
              onClick={() => setOpen((o) => ({ ...o, [cat.id]: !o[cat.id] }))}
            >
              <span className="text-foreground">{cat.title}</span>
              <span className="text-[10px] text-muted-foreground mr-2">{cat.items.length}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${open[cat.id] ? "rotate-180" : "rotate-0"}`} />
            </button>
            {open[cat.id] && (
              <div className="border-t border-border p-2">
                <div className="space-y-1">
                  {cat.items.map((item) => (
                    <div
                      key={`${cat.id}-${item.label}`}
                      className="flex cursor-grab items-center justify-between rounded px-2 py-1 text-xs hover:bg-muted"
                      draggable
                      onDragStart={onDragStart(item)}
                      title="Drag to canvas"
                    >
                      <span className="truncate text-foreground">{item.label}</span>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

