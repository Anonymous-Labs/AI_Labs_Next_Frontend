"use client";

import React from "react";

type WelcomeNodeData = {
  label?: string;
  content?: string;
};

export default function WelcomeNode({ data }: { data: WelcomeNodeData }) {
  return (
    <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-md min-w-[300px] max-w-[400px]">
      <div className="border-b border-primary/20 px-4 py-3 bg-primary/10">
        <h3 className="text-sm font-semibold text-foreground">{data?.label || "Welcome"}</h3>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
          {data?.content || ""}
        </p>
      </div>
    </div>
  );
}

