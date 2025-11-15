/**
 * Palette categories configuration
 * Defines all available node categories and their items for the palette
 */

import type { Node } from "@xyflow/react";

export interface PaletteCategory {
  id: string;
  title: string;
  items: Array<{ label: string; type?: Node["type"] }>;
}

export const PALETTE_CATEGORIES: PaletteCategory[] = [
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
      { label: "Dataset", type: "dataset" },
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
      { label: "Feature Selection", type: "featureSelection" },
      { label: "Train Test Split", type: "trainTestSplit" },
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
      { label: "Linear Regression", type: "linearRegression" },
      { label: "Predict", type: "predict" },
    ],
  },
  {
    id: "arith",
    title: "Arithmetic",
    items: [{ label: "Add2Int", type: "add2int" }],
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
      { label: "Evaluation", type: "evaluation" },
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
];

