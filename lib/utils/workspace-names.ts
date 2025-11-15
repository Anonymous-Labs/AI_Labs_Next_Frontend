/**
 * Utility functions for generating AI-related workspace names
 */

const AI_WORKSPACE_NAMES = [
  "Neural Network Lab",
  "Deep Learning Studio",
  "ML Pipeline Builder",
  "AI Model Workshop",
  "Data Science Hub",
  "Computer Vision Lab",
  "NLP Research Center",
  "Reinforcement Learning Lab",
  "Generative AI Studio",
  "Predictive Analytics Hub",
  "Feature Engineering Lab",
  "Model Training Center",
  "Data Pipeline Studio",
  "AI Experiment Lab",
  "Machine Learning Workspace",
  "Neural Architecture Lab",
  "Model Optimization Studio",
  "Data Mining Hub",
  "AI Research Lab",
  "Intelligent Systems Studio",
];

const ADJECTIVES = [
  "Advanced",
  "Experimental",
  "Research",
  "Production",
  "Development",
  "Testing",
  "Prototype",
  "Innovation",
  "Next-Gen",
  "Cutting-Edge",
];

/**
 * Generates a random AI-related workspace name
 */
export function generateWorkspaceName(): string {
  const useAdjective = Math.random() > 0.5;
  
  if (useAdjective) {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const baseName = AI_WORKSPACE_NAMES[Math.floor(Math.random() * AI_WORKSPACE_NAMES.length)];
    return `${adjective} ${baseName}`;
  }
  
  return AI_WORKSPACE_NAMES[Math.floor(Math.random() * AI_WORKSPACE_NAMES.length)];
}

