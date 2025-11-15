/**
 * Custom hooks for canvas operations
 */

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useReactFlow, useViewport, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { Node, Edge, NodeChange, EdgeChange, Connection } from "@xyflow/react";
import { nodeComponents, nodeDefinitions } from "@/lib/flow/nodeRegistry";
import { getWelcomeNodes } from "@/lib/workspace/welcomeNodes";

interface UseCanvasOptions {
  isNewWorkspace: boolean;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export function useCanvas({ isNewWorkspace, initialNodes = [], initialEdges = [] }: UseCanvasOptions) {
  const [nodes, setNodes] = useState<Node[]>(isNewWorkspace ? getWelcomeNodes() : initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const idCounter = useRef<number>(1000);
  const { setViewport, zoomIn, zoomOut, fitView, screenToFlowPosition } = useReactFlow();
  const viewport = useViewport();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Reset canvas when creating new workspace
  useEffect(() => {
    if (isNewWorkspace) {
      setNodes(getWelcomeNodes());
      setEdges([]);
      setSelectedNodeId(null);
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 100);
    }
  }, [isNewWorkspace, fitView]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);
        // Track selection
        const selectChange = changes.find((c) => c.type === "select");
        if (selectChange && selectChange.type === "select") {
          setSelectedNodeId(selectChange.selected ? selectChange.id : null);
        }
        return updated;
      });
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Dynamically build nodeTypes and nodeDefs from registry
  const nodeTypes = useMemo(() => {
    const types: Record<string, React.ComponentType<any>> = {};
    Object.entries(nodeComponents).forEach(([type, component]) => {
      types[type] = component;
    });
    return types;
  }, []);

  const nodeDefs = useMemo(() => nodeDefinitions, []);

  // Generic connection validation based on port types from node definitions
  const isValidConnection = useCallback(
    (conn: Connection) => {
      const src = nodes.find((n) => n.id === conn.source);
      const tgt = nodes.find((n) => n.id === conn.target);
      if (!src || !tgt) return false;

      const srcDef = src.type ? (nodeDefs as Record<string, any>)[src.type] : undefined;
      const tgtDef = tgt.type ? (nodeDefs as Record<string, any>)[tgt.type] : undefined;

      const srcHandleId = (conn.sourceHandle ?? null) as string | null;
      const tgtHandleId = (conn.targetHandle ?? null) as string | null;

      // Get target port type - this is what we're connecting TO
      const tgtPortType = tgtDef?.ports?.target?.[tgtHandleId || ""]?.type;

      // If target has no definition or no port type specified, allow (backward compat for old nodes)
      if (!tgtDef || !tgtPortType) return true;

      // If target accepts "any", allow connection
      if (tgtPortType === "any") return true;

      // If target requires a specific type, source must have matching type
      if (!srcDef) return false; // Source has no definition, can't verify type match

      const srcPortType = srcDef.ports?.source?.[srcHandleId || ""]?.type || "any";

      // Types must match exactly
      return srcPortType === tgtPortType;
    },
    [nodes, nodeDefs]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        setEdges((eds) => [...eds, { id: `e-${params.source}-${params.target}`, ...params }]);
      }
    },
    [isValidConnection]
  );

  const addNode = useCallback(
    (label: string, type?: string, extraData?: Record<string, unknown>) => {
      const id = `n-${idCounter.current++}`;
      const centerPoint = {
        x: (window.innerWidth / 2 - 200 - viewport.x) / viewport.zoom,
        y: (window.innerHeight / 2 - 100 - viewport.y) / viewport.zoom,
      };
      const def = type ? (nodeDefs as Record<string, any>)[type] : undefined;
      const baseData = def?.getInitialData ? def.getInitialData() : { label };

      setNodes((prev) => [
        ...prev,
        {
          id,
          data: {
            ...(baseData as any),
            ...(extraData || {}),
          },
          type,
          position: { x: centerPoint.x + Math.random() * 120 - 60, y: centerPoint.y + Math.random() * 80 - 40 },
        },
      ]);
      return id;
    },
    [viewport.x, viewport.y, viewport.zoom, nodeDefs]
  );

  const addNodeAt = useCallback(
    (label: string, position: { x: number; y: number }, type?: string, extraData?: Record<string, unknown>) => {
      const id = `n-${idCounter.current++}`;
      const def = type ? (nodeDefs as Record<string, any>)[type] : undefined;
      const baseData = def?.getInitialData ? def.getInitialData() : { label };

      setNodes((prev) => [
        ...prev,
        {
          id,
          data: {
            ...(baseData as any),
            ...(extraData || {}),
          },
          type,
          position,
        },
      ]);
      return id;
    },
    [nodeDefs]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const payload = event.dataTransfer.getData("application/reactflow");
      if (!payload) return;
      try {
        const { label, type, data: extraData } = JSON.parse(payload) as {
          label: string;
          type?: string;
          data?: Record<string, unknown>;
        };
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        addNodeAt(label, position, type, extraData);
      } catch {
        // ignore malformed drag payloads
      }
    },
    [addNodeAt, screenToFlowPosition]
  );

  const handleAutoLayout = useCallback(() => {
    setNodes((prev) => {
      const sorted = [...prev].sort((a, b) => a.position.x - b.position.x);
      const layers: Record<number, Node[]> = {};
      sorted.forEach((n) => {
        const bucket = Math.round(n.position.x / 250);
        layers[bucket] ||= [];
        layers[bucket].push(n);
      });
      const next: Node[] = [];
      Object.keys(layers)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((bucketIdx) => {
          const col = layers[bucketIdx];
          col.forEach((n, row) => {
            next.push({
              ...n,
              position: { x: bucketIdx * 250, y: -200 + row * 110 },
            });
          });
        });
      return next;
    });
    setTimeout(() => fitView({ padding: 0.2, duration: 600 }), 0);
  }, [fitView]);

  const updateNodeDataBy = useCallback((id: string, updater: (prev: any) => any) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, data: updater(n.data) } : n)));
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || nodes.find((n) => (n as any).selected),
    [nodes, selectedNodeId]
  );

  // Dataflow: Update node values based on connections
  useEffect(() => {
    setNodes((prev) => {
      let changed = false;
      const next = prev.map((node) => {
        // Handle Add2Int node: update inputs based on connected sources
        if (node.type === "add2int") {
          const aEdge = edges.find((e) => e.target === node.id && e.targetHandle === "in-a");
          const bEdge = edges.find((e) => e.target === node.id && e.targetHandle === "in-b");
          const currProps = (node.data as Record<string, any>)?.props || {};
          const currLocks = (node.data as Record<string, any>)?.locks || {};

          const getValueFromSource = (edge: typeof edges[0] | undefined): number | undefined => {
            if (!edge) return undefined;
            const src = prev.find((n) => n.id === edge.source);
            if (!src || src.type !== "integer") return undefined;
            return (src.data as Record<string, any>)?.props?.value;
          };

          const aVal = getValueFromSource(aEdge);
          const bVal = getValueFromSource(bEdge);
          const locks = {
            a: aEdge !== undefined,
            b: bEdge !== undefined,
          };

          const nextProps = { ...currProps } as Record<string, any>;
          if (aVal !== undefined) nextProps.a = aVal;
          if (bVal !== undefined) nextProps.b = bVal;

          const needProps =
            (aVal !== undefined && nextProps.a !== currProps.a) ||
            (bVal !== undefined && nextProps.b !== currProps.b);
          const needLocks = locks.a !== currLocks.a || locks.b !== currLocks.b;

          if (needProps || needLocks) {
            changed = true;
            return {
              ...node,
              data: {
                ...(node.data as Record<string, any>),
                props: { ...currProps, ...nextProps },
                locks,
              },
            };
          }
        }

        // Handle Text node: display value from connected source
        if (node.type === "text") {
          const inEdge = edges.find((e) => e.target === node.id);
          const currProps = (node.data as Record<string, any>)?.props || {};

          const getValueFromSource = (): any => {
            if (!inEdge) return currProps.value;
            const src = prev.find((n) => n.id === inEdge.source);
            if (!src) return currProps.value;
            if (src.type === "integer") {
              return (src.data as Record<string, any>)?.props?.value ?? currProps.value;
            }
            if (src.type === "add2int") {
              const a = (src.data as Record<string, any>)?.props?.a;
              const b = (src.data as Record<string, any>)?.props?.b;
              if (typeof a === "number" && typeof b === "number") return a + b;
            }
            return currProps.value;
          };

          const nextVal = getValueFromSource();
          if (nextVal !== currProps.value) {
            changed = true;
            return {
              ...node,
              data: {
                ...(node.data as Record<string, any>),
                props: { ...currProps, value: nextVal },
              },
            };
          }
        }

        return node;
      });
      return changed ? next : prev;
    });
  }, [edges, nodes, setNodes]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    nodeTypes,
    nodeDefs,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    onDrop,
    onDragOver,
    addNode,
    addNodeAt,
    handleAutoLayout,
    updateNodeDataBy,
    zoomIn,
    zoomOut,
    fitView,
    setViewport,
  };
}

