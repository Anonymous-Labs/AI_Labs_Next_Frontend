/**
 * Welcome nodes configuration for new workspaces
 */

import type { Node } from "@xyflow/react";
import type { WelcomeNodeData } from "@/types/workspace";

export function getWelcomeNodes(): Node<WelcomeNodeData>[] {
  return [
    {
      id: "welcome-1",
      position: { x: 100, y: 100 },
      data: {
        label: "👋 Welcome to AI Labs",
        content: "Start building your AI pipelines by dragging nodes from the palette on the left.",
      },
      type: undefined,
    },
    {
      id: "welcome-2",
      position: { x: 100, y: 250 },
      data: {
        label: "📚 Quick Start",
        content: "• Drag nodes from the palette\n• Connect them to build pipelines\n• Use the Inspector to configure nodes\n• Run your pipeline to see results",
      },
      type: undefined,
    },
    {
      id: "welcome-3",
      position: { x: 100, y: 450 },
      data: {
        label: "💡 Tips",
        content: "• Use Auto Layout to organize your graph\n• Search the palette for specific nodes\n• Check the Inspector for node properties",
      },
      type: undefined,
    },
  ];
}

