"use client";

import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { AuthGuard } from "@/components/providers/AuthGuard";
import {
  Background,
  BackgroundVariant,
  Panel,
  Position,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import "@xyflow/react/dist/style.css";
import { ChevronDown, Play, Square, Save, Plus, ZoomIn, ZoomOut, LayoutGrid, Share2, Search, Cpu, Github, HelpCircle, User, Bell, MessageSquare, History, Wand2, FileUp, FileDown, BookOpen, Bug, Eye, EyeOff, PanelLeft, PanelRight, Grid3X3, MoreHorizontal, GitBranch, Upload, Download, Users, Settings as SettingsIcon, CalendarClock, RefreshCw, RotateCw } from "lucide-react";
import { nodeComponents, nodeDefinitions } from "@/lib/flow/nodeRegistry";
import { Input } from "@/components/ui/input";
import { OpenWorkspaceModal } from "@/components/workspace/OpenWorkspaceModal";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useCreateWorkspace, useUpdateWorkspace } from "@/api/hooks/use-workspace";
import { generateWorkspaceName } from "@/lib/utils/workspace-names";
import { WorkspaceService } from "@/api/services/workspace.service";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

/**
 * Workspace Page - React Flow Canvas
 * Main workspace for AI development with node-based editing
 */
// Welcome nodes for first-time users
const getWelcomeNodes = (): Node[] => [
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

export default function WorkspacePage() {
  const { signOut, user } = useAuthStore();
  const { id: workspaceId, name: workspaceName, isNew: isNewWorkspace, setWorkspace, hasWorkspace, saveState, setSaveState } = useWorkspaceStore();
  const createWorkspaceMutation = useCreateWorkspace();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const [activeMenu, setActiveMenu] = useState<null | "File" | "Edit" | "View" | "Insert" | "Runtime" | "Tools" | "Help">(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [runtimeOpen, setRuntimeOpen] = useState(false);
  const [runtimeType, setRuntimeType] = useState<"CPU" | "GPU" | "TPU">("GPU");
  const [showPalette, setShowPalette] = useState(true);
  const [openModalOpen, setOpenModalOpen] = useState(false);
  
  // Debounced save function for graph
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounced rename function
  const renameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for dynamic input sizing
  const workspaceNameInputRef = useRef<HTMLInputElement>(null);
  const workspaceNameMeasureRef = useRef<HTMLSpanElement>(null);
  
  const saveWorkspaceGraph = useCallback(async (nodes: Node[], edges: Edge[]) => {
    if (!workspaceId) return;
    
    setSaveState("saving");
    try {
      await WorkspaceService.saveWorkspaceGraph(workspaceId, {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        })),
      });
      setSaveState("saved");
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (error) {
      console.error("Failed to save workspace:", error);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }, [workspaceId, setSaveState]);
  
  const debouncedSave = useCallback((nodes: Node[], edges: Edge[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveWorkspaceGraph(nodes, edges);
    }, 1000); // 1 second debounce
  }, [saveWorkspaceGraph]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  // Reset save state when workspace changes
  useEffect(() => {
    setSaveState("idle");
  }, [workspaceId, setSaveState]);
  
  // Debounced workspace name update
  const handleWorkspaceNameChange = useCallback((newName: string) => {
    // Update local state immediately for responsive UI
    setWorkspace({ name: newName });
    
    // Update input width based on content
    if (workspaceNameMeasureRef.current && workspaceNameInputRef.current) {
      workspaceNameMeasureRef.current.textContent = newName || "Untitled Workspace";
      const width = workspaceNameMeasureRef.current.offsetWidth;
      workspaceNameInputRef.current.style.width = `${Math.max(width + 16, 100)}px`;
    }
    
    // Debounce API call
    if (renameTimeoutRef.current) {
      clearTimeout(renameTimeoutRef.current);
    }
    
    if (!workspaceId) return; // Don't save if no workspace ID
    
    renameTimeoutRef.current = setTimeout(async () => {
      try {
        const updated = await updateWorkspaceMutation.mutateAsync({
          id: workspaceId,
          input: { name: newName },
        });
        // Update store with response from API
        setWorkspace({ name: updated.name });
      } catch (error) {
        console.error("Failed to rename workspace:", error);
        // Optionally revert to previous name on error
      }
    }, 800); // 800ms debounce for rename
  }, [workspaceId, updateWorkspaceMutation, setWorkspace]);
  
  // Initialize input width on mount and when workspace name changes
  useEffect(() => {
    if (workspaceNameMeasureRef.current && workspaceNameInputRef.current) {
      workspaceNameMeasureRef.current.textContent = workspaceName || "Untitled Workspace";
      const width = workspaceNameMeasureRef.current.offsetWidth;
      workspaceNameInputRef.current.style.width = `${Math.max(width + 16, 100)}px`;
    }
  }, [workspaceName]);
  
  // Cleanup rename timeout on unmount
  useEffect(() => {
    return () => {
      if (renameTimeoutRef.current) {
        clearTimeout(renameTimeoutRef.current);
      }
    };
  }, []);

  function CanvasArea({ showPalette, setShowPalette, isNewWorkspace, hasWorkspace, onSave }: { showPalette: boolean; setShowPalette: (v: boolean) => void; isNewWorkspace: boolean; hasWorkspace: boolean; onSave: (nodes: Node[], edges: Edge[]) => void }) {
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
      (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
      []
    );

    const onEdgesChange = useCallback(
      (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
      []
    );
    
    // Auto-save when nodes or edges change (debounced)
    const isInitialMount = useRef(true);
    useEffect(() => {
      // Skip save on initial mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      
      if (!hasWorkspace || isNewWorkspace) return;
      if (nodes.length === 0 && edges.length === 0) return; // Don't save empty state
      
      onSave(nodes, edges);
    }, [nodes, edges, hasWorkspace, isNewWorkspace, onSave]);

    // Dynamically build nodeTypes and nodeDefs from registry
    const nodeTypes = useMemo(() => {
      const types: Record<string, any> = {};
      Object.entries(nodeComponents).forEach(([type, component]) => {
        types[type] = component as any;
      });
      return types;
    }, []);

    const nodeDefs = useMemo(() => nodeDefinitions, []);

    // Generic connection validation based on port types from node definitions
    const isValidConnection = useCallback(
      (conn: any) => {
        const src = nodes.find((n) => n.id === conn.source);
        const tgt = nodes.find((n) => n.id === conn.target);
        if (!src || !tgt) return false;

        const srcDef = src.type ? (nodeDefs as any)[src.type] : undefined;
        const tgtDef = tgt.type ? (nodeDefs as any)[tgt.type] : undefined;

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
          setEdges((eds) => addEdge(params, eds));
        }
      },
      [isValidConnection]
    );

    const edgeTypes = useMemo(() => ({}), []);

    const addNode = useCallback(
      (label: string, type?: Node["type"], extraData?: Record<string, unknown>) => {
        const id = `n-${idCounter.current++}`;
        const centerPoint = {
          x: (window.innerWidth / 2 - 200 - viewport.x) / viewport.zoom,
          y: (window.innerHeight / 2 - 100 - viewport.y) / viewport.zoom,
        };
        const def = type ? (nodeDefs as any)[type] : undefined;
        const baseData = def?.getInitialData ? def.getInitialData() : { label };
        setNodes((prev) => [
          ...prev,
          {
            id,
            data: {
              ...(baseData as any),
              ...(extraData || {}),
              ...(type === "integer"
                ? {
                    onChange: (next: number) => {
                      setNodes((p) =>
                        p.map((n) =>
                          n.id === id
                            ? { ...n, data: { ...(n.data as any), props: { ...((n.data as any).props || {}), value: next } } }
                            : n
                        )
                      );
                    },
                  }
                : type === "add2int"
                ? {
                    onChangeA: (next: number) => {
                      setNodes((p) => p.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), props: { ...((n.data as any).props || {}), a: next } } } : n)));
                    },
                    onChangeB: (next: number) => {
                      setNodes((p) => p.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), props: { ...((n.data as any).props || {}), b: next } } } : n)));
                    },
                  }
                : {}),
            },
            type,
            position: { x: centerPoint.x + Math.random() * 120 - 60, y: centerPoint.y + Math.random() * 80 - 40 },
          },
        ]);
        return id;
      },
      [viewport.x, viewport.y, viewport.zoom, setNodes, nodeDefs]
    );

    const addConnected = useCallback(
      (fromId: string, label: string, type?: Node["type"]) => {
        const toId = addNode(label, type);
        setEdges((prev) => [...prev, { id: `e-${fromId}-${toId}`, source: fromId, target: toId }]);
      },
      [addNode]
    );

    const addNodeAt = useCallback(
      (label: string, position: { x: number; y: number }, type?: Node["type"], extraData?: Record<string, unknown>) => {
        const id = `n-${idCounter.current++}`;
        const def = type ? (nodeDefs as any)[type] : undefined;
        const baseData = def?.getInitialData ? def.getInitialData() : { label };
        setNodes((prev) => [
          ...prev,
          {
            id,
            data: {
              ...(baseData as any),
              ...(extraData || {}),
              ...(type === "integer"
                ? {
                    onChange: (next: number) => {
                      setNodes((p) =>
                        p.map((n) =>
                          n.id === id
                            ? { ...n, data: { ...(n.data as any), props: { ...((n.data as any).props || {}), value: next } } }
                            : n
                        )
                      );
                    },
                  }
                : type === "add2int"
                ? {
                    onChangeA: (next: number) => {
                      setNodes((p) => p.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), props: { ...((n.data as any).props || {}), a: next } } } : n)));
                    },
                    onChangeB: (next: number) => {
                      setNodes((p) => p.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), props: { ...((n.data as any).props || {}), b: next } } } : n)));
                    },
                  }
                : {}),
            },
            type,
            position,
          },
        ]);
        return id;
      },
      [setNodes, nodeDefs]
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

    const onDragOver = useCallback((event: React.DragEvent) => {
      if (!hasWorkspace) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }, [hasWorkspace]);

    const onDrop = useCallback(
      (event: React.DragEvent) => {
        if (!hasWorkspace) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        const payload = event.dataTransfer.getData("application/reactflow");
        if (!payload) return;
        try {
          const { label, type, data: extraData } = JSON.parse(payload) as { label: string; type?: Node["type"]; data?: Record<string, unknown> };
          const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
          addNodeAt(label, position, type, extraData);
        } catch {
          // ignore malformed drag payloads
        }
      },
      [addNodeAt, screenToFlowPosition, hasWorkspace]
    );

    const updateNodeData = useCallback((id: string, patch: Record<string, unknown>) => {
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), ...patch } } : n)));
    }, []);
    const updateNodeDataBy = useCallback((id: string, updater: (prev: any) => any) => {
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, data: updater(n.data) } : n)));
    }, []);

    const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || nodes.find((n) => (n as any).selected), [nodes, selectedNodeId]);

    // Dataflow: derive sink node inputs from connected sources, and lock inputs when connected
    useEffect(() => {
      setNodes((prev) => {
        let changed = false;
        const next = prev.map((node) => {
          if (node.type === "add2int") {
            const inEdges = edges.filter((e) => e.target === node.id);
            const aEdge = inEdges.find((e) => (e as any).targetHandle === "in-a");
            const bEdge = inEdges.find((e) => (e as any).targetHandle === "in-b");

            const findSourceValue = (edge: Edge | undefined): number | undefined => {
              if (!edge) return undefined;
              const src = prev.find((n) => n.id === edge.source);
              if (!src) return undefined;
              if (src.type === "integer") {
                const v = (src.data as any)?.props?.value;
                return typeof v === "number" ? v : undefined;
              }
              return undefined;
            };

            const aVal = findSourceValue(aEdge);
            const bVal = findSourceValue(bEdge);
            const locks = { a: Boolean(aEdge), b: Boolean(bEdge) };

            const currProps = (node.data as any)?.props || {};
            const currLocks = (node.data as any)?.locks || {};

            const nextProps = { ...currProps } as any;
            if (aVal !== undefined) nextProps.a = aVal;
            if (bVal !== undefined) nextProps.b = bVal;

            const needProps = (aVal !== undefined && nextProps.a !== currProps.a) || (bVal !== undefined && nextProps.b !== currProps.b);
            const needLocks = locks.a !== currLocks.a || locks.b !== currLocks.b;

            if (needProps || needLocks) {
              changed = true;
              return {
                ...node,
                data: {
                  ...(node.data as any),
                  props: { ...currProps, ...nextProps },
                  locks,
                },
              };
            }
          }
          if (node.type === "text") {
            const inEdge = edges.find((e) => e.target === node.id);
            const currProps = (node.data as any)?.props || {};

            const getValueFromSource = (): any => {
              if (!inEdge) return currProps.value;
              const src = prev.find((n) => n.id === inEdge.source);
              if (!src) return currProps.value;
              if (src.type === "integer") {
                return (src.data as any)?.props?.value ?? currProps.value;
              }
              if (src.type === "add2int") {
                const a = (src.data as any)?.props?.a;
                const b = (src.data as any)?.props?.b;
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
                  ...(node.data as any),
                  props: { ...currProps, value: nextVal },
                },
              };
            }
          }
          return node;
        });
        return changed ? next : prev;
      });
    }, [edges, nodes]);

    return (
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={({ nodes: sel }) => setSelectedNodeId(sel[0]?.id ?? null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        className="bg-background"
      >
        {/* Top Panel (toolbar) */}
        <Panel position="top-center" className="rounded-md border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-sm flex items-center gap-2">
          {!hasWorkspace && (
            <div className="text-xs text-muted-foreground mr-2">Create a workspace to start building</div>
          )}
          <Button size="sm" variant="secondary" onClick={() => addNode("Dataset", "dataset")} disabled={!hasWorkspace}>Add Dataset</Button>
          <Button size="sm" variant="secondary" onClick={() => addNode("Dataset", "input")} disabled={!hasWorkspace}>Add Dataset</Button>
          <Button size="sm" variant="secondary" onClick={() => addNode("Processor")} disabled={!hasWorkspace}>Add Processor</Button>
          <Button size="sm" variant="secondary" onClick={() => addNode("Model")} disabled={!hasWorkspace}>Add Model</Button>
          <Button size="sm" variant="secondary" onClick={() => addNode("Metric", "output")} disabled={!hasWorkspace}>Add Metric</Button>
          <div className="mx-2 h-5 w-px bg-border" />
          <Button size="sm" variant="outline" onClick={() => zoomIn({ duration: 200 })}>Zoom In</Button>
          <Button size="sm" variant="outline" onClick={() => zoomOut({ duration: 200 })}>Zoom Out</Button>
          <Button size="sm" variant="default" onClick={() => fitView({ padding: 0.2, duration: 400 })}>Fit</Button>
          <Button size="sm" variant="default" onClick={handleAutoLayout}>Auto Layout</Button>
        </Panel>

        {/* Left Panel (palette) */}
        {showPalette ? (
        <Panel position="top-left" className="m-3 w-72 rounded-md border border-border bg-card/95 backdrop-blur p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Palette (drag items to canvas)</p>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowPalette(false)} title="Collapse palette">
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
          {!hasWorkspace && (
            <div className="mb-2 rounded-md bg-muted/50 border border-border p-2 text-xs text-muted-foreground">
              Create a workspace to enable drag & drop
            </div>
          )}
          <Palette categories={[
            {
              id: "input",
              title: "Inputs & Sources",
              items: [
                { label: "Data Source: S3", type: "input" },
                { label: "Data Source: GCS", type: "input" },
                { label: "Data Source: Azure Blob", type: "input" },
                { label: "Ingest: Kafka" },
                { label: "Ingest: Kinesis" },
                { label: "Ingest: REST" },
                { label: "Query: BigQuery" },
                { label: "Query: Snowflake" },
                { label: "Query: Postgres" },
                { label: "Integer", type: "integer" },
                { label: "Dataset", type: "dataset" }, // Added DatasetNode
              ],
            },
            {
              id: "pre",
              title: "Pre-processing",
              items: [
                { label: "Validate: Great Expectations" },
                { label: "Clean: Missing/Outliers" },
                { label: "Normalize & Scale" },
                { label: "Encode: One-Hot/Label" },
                { label: "Feature Store" },
                { label: "Time Window Aggregations" },
                { label: "Augment: SMOTE" },
                { label: "Split: Train/Val/Test" },
                { label: "Feature Selection", type: "featureSelection" }, // Added FeatureSelectionNode
                { label: "Train Test Split", type: "trainTestSplit" }, // Added TrainTestSplitNode to the palette
              ],
            },
            {
              id: "feature",
              title: "Feature Engineering",
              items: [
                { label: "Text: TF-IDF" },
                { label: "Text: Embeddings" },
                { label: "Vision: Resize/Augment" },
                { label: "Tabular: PCA" },
                { label: "Cross Features" },
              ],
            },
            {
              id: "models",
              title: "Models",
              items: [
                { label: "Train: XGBoost" },
                { label: "Train: LightGBM" },
                { label: "Train: CatBoost" },
                { label: "Train: Scikit-learn" },
                { label: "Train: PyTorch" },
                { label: "Train: TensorFlow" },
                { label: "Train: LLM Fine-tune" },
                { label: "Linear Regression", type: "linearRegression" }, // Added LinearRegressionNode to the palette
                { label: "Predict", type: "predict" }, // Added PredictNode to the palette
              ],
            },
            {
              id: "arith",
              title: "Arithmetic",
              items: [
                { label: "Add2Int", type: "add2int" },
              ],
            },
            {
              id: "eval",
              title: "Evaluation & Metrics",
              items: [
                { label: "Evaluate: AUC", type: "output" },
                { label: "Evaluate: F1 / Precision / Recall" },
                { label: "Cross-Validation" },
                { label: "Confusion Matrix" },
                { label: "Calibration Curve" },
                { label: "Evaluation", type: "evaluation" }, // Added EvaluationNode to the palette
              ],
            },
            {
              id: "visual",
              title: "Visualization",
              items: [
                { label: "Embeddings: UMAP" },
                { label: "Embeddings: t-SNE" },
                { label: "Feature Importance" },
                { label: "Explain: SHAP" },
              ],
            },
            {
              id: "monitor",
              title: "Monitoring",
              items: [
                { label: "Data Drift Monitor" },
                { label: "Concept Drift Monitor" },
                { label: "Model Performance Monitor" },
                { label: "Alert Webhook" },
              ],
            },
            {
              id: "deploy",
              title: "Deployment / Output",
              items: [
                { label: "Text Output", type: "text" },
                { label: "Deploy: REST", type: "output" },
                { label: "Deploy: gRPC", type: "output" },
                { label: "Batch Scoring Job" },
                { label: "A/B Experiment" },
              ],
            },
            {
              id: "orchestrate",
              title: "Orchestration",
              items: [
                { label: "Trigger: Schedule" },
                { label: "Trigger: Webhook" },
                { label: "Branch / Condition" },
                { label: "Parallel / Fan-out" },
                { label: "Cache / Checkpoint" },
              ],
            },
            {
              id: "nlp",
              title: "NLP",
              items: [
                { label: "Tokenize" },
                { label: "NER" },
                { label: "Sentiment" },
                { label: "LLM: Prompt" },
                { label: "LLM: RAG" },
              ],
            },
            {
              id: "cv",
              title: "Computer Vision",
              items: [
                { label: "Image Loader" },
                { label: "Augment: Flip/Rotate" },
                { label: "Detect: YOLO" },
                { label: "Segment: U-Net" },
              ],
            },
            {
              id: "utils",
              title: "Utilities",
              items: [
                { label: "Python Script" },
                { label: "Environment Var" },
                { label: "Secrets Manager" },
                { label: "HTTP Request" },
                { label: "Slack Notification" },
              ],
            },
          ]}
          onDragStart={(item) => (event) => {
            if (!hasWorkspace) {
              event.preventDefault();
              return;
            }
            event.dataTransfer.setData("application/reactflow", JSON.stringify(item));
            event.dataTransfer.effectAllowed = "move";
          }}
          hasWorkspace={hasWorkspace}
          />
        </Panel>
        ) : (
          <Panel position="top-left" className="m-3">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowPalette(true)} title="Open palette">
              <PanelRight className="h-4 w-4" /> Palette
            </Button>
          </Panel>
        )}

        {/* Right Panel (inspector) */}
        <Panel position="top-right" className="m-3 w-72 rounded-md border border-border bg-card/95 backdrop-blur p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Inspector</p>
            {selectedNode && (
              <span className="text-[10px] text-muted-foreground">{selectedNode.type || "default"}</span>
            )}
          </div>
          {!selectedNode ? (
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Select a node to view its properties</p>
              <p>• Use Auto Layout to tidy your graph</p>
              <p>• Add nodes from the Palette</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                const type = selectedNode.type as string | undefined;
                const def = type ? (nodeDefs as any)[type] : undefined;
                if (def?.Inspector) {
                  const InspectorComp = def.Inspector as React.ComponentType<{ data: any; onChange: (updater: (prev: any) => any) => void }>;
                  return (
                    <InspectorComp
                      data={selectedNode.data}
                      onChange={(updater) => updateNodeDataBy(selectedNode.id, updater)}
                    />
                  );
                }
                return (
                  <div className="text-xs text-muted-foreground">No inspector available for this node.</div>
                );
              })()}

              <div>
                <label className="mb-1 block text-[10px] text-muted-foreground">Data</label>
                <div className="rounded-md border border-border bg-muted/40 p-2 text-[10px] text-foreground">
                  <pre className="whitespace-pre-wrap break-all">{JSON.stringify(selectedNode.data, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </Panel>

        {/* Bottom Panel (quick actions) */}
        <Panel position="bottom-center" className="mb-3 rounded-md border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-sm flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 })}>Reset View</Button>
          <Button size="sm" variant="outline" onClick={() => {
            const a = addNode("Experiment");
            addConnected(a, "Train: CatBoost");
          }}>Quick Experiment</Button>
          <Button size="sm" variant="destructive" onClick={() => { setNodes([]); setEdges([]); }}>Clear</Button>
        </Panel>

        <Controls className="border-border bg-card shadow-sm" />
        <MiniMap className="border-border bg-card shadow-sm" />
        <Background variant={BackgroundVariant.Lines} gap={12} size={1} color="#dadce0" />
      </ReactFlow>
    );
  }

  function Palette({
    categories,
    onDragStart,
    hasWorkspace,
  }: {
    categories: Array<{ id: string; title: string; items: Array<{ label: string; type?: Node["type"] }> }>;
    onDragStart: (item: { label: string; type?: Node["type"] }) => (e: React.DragEvent) => void;
    hasWorkspace: boolean;
  }) {
    const [open, setOpen] = useState<Record<string, boolean>>({ input: true, pre: true, feature: true, models: true, eval: true, visual: true, monitor: true, deploy: true, orchestrate: true, nlp: false, cv: false, utils: false });
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
                        className={`flex items-center justify-between rounded px-2 py-1 text-xs ${
                          hasWorkspace
                            ? "cursor-grab hover:bg-muted"
                            : "cursor-not-allowed opacity-50"
                        }`}
                        draggable={hasWorkspace}
                        onDragStart={onDragStart(item)}
                        title={hasWorkspace ? "Drag to canvas" : "Create a workspace first"}
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

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen flex-col bg-background">
        <header className="border-b border-border bg-background shadow-sm">
          {/* Top Nav: App icon, title, search, share, profile */}
          <div className="mx-auto max-w-full px-2">
            {/* First row: App icon, workspace name, and right controls */}
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-lg font-bold">AI</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative inline-block">
                    {/* Hidden span to measure text width */}
                    <span
                      ref={workspaceNameMeasureRef}
                      className="invisible absolute whitespace-pre text-base font-semibold"
                      aria-hidden="true"
                    >
                      {workspaceName || "Untitled Workspace"}
                    </span>
                    <input
                      ref={workspaceNameInputRef}
                      type="text"
                      className="bg-transparent text-base font-semibold text-foreground outline-none focus:ring-0 hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                      value={workspaceName}
                      onChange={(e) => handleWorkspaceNameChange(e.target.value)}
                      aria-label="Workspace name"
                      placeholder="Untitled Workspace"
                    />
                  </div>
                  {workspaceId && (
                    <div className="flex items-center gap-1.5 text-xs">
                      {saveState === "saving" && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      )}
                      {saveState === "saved" && (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Saved</span>
                        </div>
                      )}
                      {saveState === "error" && (
                        <div className="flex items-center gap-1.5 text-red-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Error saving</span>
                        </div>
                      )}
                      {saveState === "idle" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 md:flex">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className="h-8 w-56 rounded-md border border-border bg-background pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Search workspace"
                    />
                  </div>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                  <div className="relative">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setRuntimeOpen((o)=>!o)}>
                      <Cpu className="h-4 w-4" /> {runtimeType}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    {runtimeOpen && (
                      <div className="absolute right-0 z-30 mt-1 w-56 rounded-md border border-border bg-card p-1 shadow-lg">
                        {["CPU","GPU","TPU"].map((rt) => (
                          <button key={rt} className="w-full rounded px-2 py-1.5 text-left hover:bg-muted" onClick={() => { setRuntimeType(rt as any); setRuntimeOpen(false); }}>
                            {rt}
                          </button>
                        ))}
                        <div className="my-1 h-px bg-border" />
                        <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Manage runtimes…</button>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" aria-label="Comments">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Button size="sm" variant="ghost" className="gap-1" onClick={() => setAccountOpen((o)=>!o)}>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  {accountOpen && (
                    <div className="absolute right-0 z-30 mt-1 w-60 rounded-md border border-border bg-card p-1 shadow-lg">
                      <div className="px-2 py-2 text-xs text-muted-foreground">
                        {user ? (user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.email) : "Guest"}
                      </div>
                      <div className="my-1 h-px bg-border" />
                      <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Profile</button>
                      <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Settings</button>
                      <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Keyboard Shortcuts</button>
                      <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Billing</button>
                      <div className="my-1 h-px bg-border" />
                      <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted" onClick={signOut}>Sign out</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Second row: Menu bar */}
            <div className="flex h-10 items-center border-t border-border">
              <nav className="flex items-center gap-1" onMouseLeave={() => setActiveMenu(null)}>
                  {(["File","Edit","View","Insert","Runtime","Tools","Help"] as const).map((label) => (
                    <div key={label} className="relative">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`px-2 text-sm ${activeMenu===label?"bg-muted":""}`}
                        onMouseEnter={() => setActiveMenu(label)}
                        onClick={() => setActiveMenu((m)=>m===label?null:label)}
                      >
                        {label}
                      </Button>
                      {activeMenu===label && (
                        <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-md border border-border bg-card p-1 shadow-lg">
                          {label==="File" && (
                            <div className="text-sm">
                              <button
                                className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={async () => {
                                  try {
                                    const randomName = generateWorkspaceName();
                                    const newWorkspace = await createWorkspaceMutation.mutateAsync({ name: randomName });
                                    setWorkspace({
                                      id: newWorkspace.id,
                                      name: newWorkspace.name,
                                      isNew: true,
                                    });
                                    setActiveMenu(null);
                                  } catch (error) {
                                    console.error("Failed to create workspace:", error);
                                  }
                                }}
                                disabled={createWorkspaceMutation.isPending}
                              >
                                <Plus className="h-3.5 w-3.5" /> {createWorkspaceMutation.isPending ? "Creating..." : "New Workspace"}
                              </button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">New from Template</button>
                              <button
                                className="w-full rounded px-2 py-1.5 text-left hover:bg-muted"
                                onClick={() => {
                                  setOpenModalOpen(true);
                                  setActiveMenu(null);
                                }}
                              >
                                Open…
                              </button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Rename</button>
                              <div className="my-1 h-px bg-border" />
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Make a copy</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><FileUp className="h-3.5 w-3.5" /> Import graph (JSON)</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><FileDown className="h-3.5 w-3.5" /> Export graph (JSON)</button>
                              <div className="my-1 h-px bg-border" />
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Version history</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Publish workspace</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Page settings</button>
                            </div>
                          )}
                          {label==="Edit" && (
                            <div className="text-sm">
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Undo</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Redo</button>
                              <div className="my-1 h-px bg-border" />
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Cut</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Copy</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Paste</button>
                              <div className="my-1 h-px bg-border" />
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Find/Replace</button>
                            </div>
                          )}
                          {label==="View" && (
                            <div className="text-sm">
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><ZoomIn className="h-3.5 w-3.5" /> Zoom In</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><ZoomOut className="h-3.5 w-3.5" /> Zoom Out</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Fit to Screen</button>
                              <div className="my-1 h-px bg-border" />
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2" onClick={() => setShowPalette((v)=>!v)}><PanelLeft className="h-3.5 w-3.5" /> Toggle Palette</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><PanelRight className="h-3.5 w-3.5" /> Toggle Inspector</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><Grid3X3 className="h-3.5 w-3.5" /> Toggle Grid</button>
                            </div>
                          )}
                          {label==="Insert" && (
                            <div className="text-sm">
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Node: Dataset</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Node: Transformation</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Node: Model</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Node: Evaluation</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Node: Deployment</button>
                              <div className="my-1 h-px bg-border" />
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">From Template Gallery…</button>
                            </div>
                          )}
                          {label==="Runtime" && (
                            <div className="text-sm">
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><Play className="h-3.5 w-3.5" /> Run all</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Run selected</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><Square className="h-3.5 w-3.5" /> Stop</button>
                              <div className="my-1 h-px bg-border" />
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Restart runtime</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Clear outputs</button>
                              <div className="my-1 h-px bg-border" />
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Change runtime type…</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Manage sessions</button>
                            </div>
                          )}
                          {label==="Tools" && (
                            <div className="text-sm">
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><LayoutGrid className="h-3.5 w-3.5" /> Auto Layout</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Validate Graph</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><Wand2 className="h-3.5 w-3.5" /> Optimize Pipeline</button>
                              <div className="my-1 h-px bg-border" />
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Generate Docs</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Manage Integrations</button>
                            </div>
                          )}
                          {label==="Help" && (
                            <div className="text-sm">
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> Documentation</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted">Keyboard Shortcuts</button>
                              <button className="w-full rounded px-2 py-1.5 text-left hover:bg-muted flex items-center gap-2"><Bug className="h-3.5 w-3.5" /> Report an issue</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
            </div>
          </div>

          {/* Secondary Toolbar */}
          <div className="border-t border-border">
            <div className="mx-auto max-w-full px-2">
              <div className="flex h-10 items-center justify-between">
              <div className="flex items-center gap-1 py-1">
                <Button size="sm" variant="default" className="gap-1"><Play className="h-4 w-4" /> Run all</Button>
                <Button size="sm" variant="outline" className="gap-1">Run selected</Button>
                <Button size="sm" variant="outline" className="gap-1"><Square className="h-4 w-4" /> Stop</Button>
                <div className="mx-1 h-6 w-px bg-border" />
                <Button size="sm" variant="ghost" className="gap-1"><Save className="h-4 w-4" /> Save</Button>
                <Button size="sm" variant="ghost" className="gap-1"><History className="h-4 w-4" /> Version</Button>
                <Button size="sm" variant="ghost" className="gap-1"><GitBranch className="h-4 w-4" /> Branch</Button>
                <Button size="sm" variant="ghost" className="gap-1"><Upload className="h-4 w-4" /> Publish</Button>
                <Button size="sm" variant="ghost" className="gap-1"><CalendarClock className="h-4 w-4" /> Schedule</Button>
                <div className="mx-1 h-6 w-px bg-border" />
                <Button size="sm" variant="ghost" className="gap-1"><Plus className="h-4 w-4" /> Add Node</Button>
                <Button size="sm" variant="ghost" className="gap-1"><LayoutGrid className="h-4 w-4" /> Auto Layout</Button>
                <Button size="sm" variant="ghost" className="gap-1"><RotateCw className="h-4 w-4" /> Refresh</Button>
                <div className="mx-1 h-6 w-px bg-border" />
                <Button size="sm" variant="ghost" className="gap-1">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="gap-1">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="gap-1"><Eye className="h-4 w-4" /> Preview</Button>
              </div>
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                <div className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
                  <Cpu className="h-3.5 w-3.5" /> {runtimeType}: idle
                </div>
                <div className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
                  <Github className="h-3.5 w-3.5" /> Synced
                </div>
                <div className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
                  <Users className="h-3.5 w-3.5" /> Collaborators
                </div>
                <div className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
                  <HelpCircle className="h-3.5 w-3.5" /> Help
                </div>
              </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <ReactFlowProvider>
            <CanvasArea showPalette={showPalette} setShowPalette={setShowPalette} isNewWorkspace={isNewWorkspace} hasWorkspace={hasWorkspace()} onSave={debouncedSave} />
          </ReactFlowProvider>
        </div>

        <OpenWorkspaceModal
          isOpen={openModalOpen}
          onClose={() => setOpenModalOpen(false)}
          onOpenWorkspace={(workspace) => {
            // Load existing workspace
            setWorkspace({
              id: workspace.id,
              name: workspace.name,
              isNew: false,
            });
            setOpenModalOpen(false);
            // TODO: Load workspace graph data from backend
          }}
          onCreateNew={(workspace) => {
            // Create and open new workspace
            setWorkspace({
              id: workspace.id,
              name: workspace.name,
              isNew: true,
            });
            setOpenModalOpen(false);
          }}
        />
      </div>
    </AuthGuard>
  );
}
