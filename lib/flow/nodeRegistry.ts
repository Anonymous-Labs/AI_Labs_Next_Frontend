/**
 * Centralized Node Registry
 * 
 * This file imports all node definitions and exports them in a single registry.
 * This allows the canvas to dynamically load node types and their definitions
 * without cluttering the main page component.
 * 
 * To add a new node:
 * 1. Create the node component file in components/flow/nodes/
 * 2. Import the node definition here
 * 3. Add it to nodeDefinitions and nodeComponents
 */

import IntegerNode, { integerNodeDefinition } from "@/components/flow/nodes/IntegerNode";
import Add2IntNode, { add2IntNodeDefinition } from "@/components/flow/nodes/Add2IntNode";
import TextNode, { textNodeDefinition } from "@/components/flow/nodes/TextNode";
import DatasetNode, { datasetNodeDefinition } from "@/components/flow/nodes/DatasetNode";
import FeatureSelectionNode, { featureSelectionNodeDefinition } from "@/components/flow/nodes/FeatureSelectionNode";
import TrainTestSplitNode, { trainTestSplitNodeDefinition } from "@/components/flow/nodes/TrainTestSplitNode";
import LinearRegressionNode, { linearRegressionNodeDefinition } from "@/components/flow/nodes/LinearRegressionNode";
import PredictNode, { predictNodeDefinition } from "@/components/flow/nodes/PredictNode";
import EvaluationNode, { evaluationNodeDefinition } from "@/components/flow/nodes/EvaluationNode";
import WelcomeNode from "@/components/flow/nodes/WelcomeNode";

/**
 * Node Components Registry
 * Maps node type strings to their React components
 */
export const nodeComponents = {
  integer: IntegerNode,
  add2int: Add2IntNode,
  text: TextNode,
  dataset: DatasetNode,
  featureSelection: FeatureSelectionNode,
  trainTestSplit: TrainTestSplitNode,
  linearRegression: LinearRegressionNode,
  predict: PredictNode,
  evaluation: EvaluationNode,
  welcome: WelcomeNode,
} as const;

/**
 * Node Definitions Registry
 * Maps node type strings to their definitions (ports, initial data, inspector, etc.)
 */
export const nodeDefinitions = {
  integer: integerNodeDefinition,
  add2int: add2IntNodeDefinition,
  text: textNodeDefinition,
  dataset: datasetNodeDefinition,
  featureSelection: featureSelectionNodeDefinition,
  trainTestSplit: trainTestSplitNodeDefinition,
  linearRegression: linearRegressionNodeDefinition,
  predict: predictNodeDefinition,
  evaluation: evaluationNodeDefinition,
} as const;

/**
 * Get all registered node types
 */
export function getNodeTypes() {
  return Object.keys(nodeComponents);
}

/**
 * Get node component by type
 */
export function getNodeComponent(type: string) {
  return (nodeComponents as any)[type];
}

/**
 * Get node definition by type
 */
export function getNodeDefinition(type: string) {
  return (nodeDefinitions as any)[type];
}

