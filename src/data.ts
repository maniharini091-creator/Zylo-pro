import { ChatMode, UserMemoryProfile } from "./types";

export interface ModeConfig {
  id: ChatMode;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  placeholder: string;
}

export const MODES: ModeConfig[] = [
  {
    id: "study",
    name: "Study Companion",
    shortName: "Study",
    icon: "BookOpen",
    description: "Learn CA Intermediate subjects step-by-step with practical examples and clear explanations.",
    placeholder: "Ask Zylo..."
  },
  {
    id: "evaluator",
    name: "Answer Evaluator (ICAI Style)",
    shortName: "Evaluate",
    icon: "FileCheck",
    description: "Upload any document (Excel, PDF, image) or paste your answer. Zylo will evaluate and grade it against ICAI standards.",
    placeholder: "Ask Zylo..."
  },
  {
    id: "qa",
    name: "Quick Q&A & Calculations",
    shortName: "Q&A",
    icon: "Zap",
    description: "Instant, crisp answers on thresholds, tax brackets, rules, section numbers, or fast direct tax calculations.",
    placeholder: "Ask Zylo..."
  },
  {
    id: "recall",
    name: "Active Recall Quiz Master",
    shortName: "Quiz",
    icon: "BrainCircuit",
    description: "Test your memory. Zylo will ask scenario-based questions on CA Intermediate topics and evaluate your answers.",
    placeholder: "Ask Zylo..."
  }
];

export interface SuggestionChip {
  title: string;
  prompt: string;
  mode: ChatMode;
  category: "Accounts" | "Law" | "Audit" | "Quiz" | "OCR";
}

export const SUGGESTIONS: SuggestionChip[] = [
  {
    title: "Evaluate Handwritten Sheet 📝",
    prompt: "Evaluate my handwritten answer sheet. I'm attaching the photo below. Please act as a strict ICAI examiner, check the standard references, computation steps, and give me a score out of 10 with suggestions.",
    mode: "evaluator",
    category: "OCR"
  },
  {
    title: "AS 10: PPE Accounting 🏢",
    prompt: "Explain the recognition and measurement criteria for Property, Plant, and Equipment (PPE) under AS 10. Give me some practical examples of direct and indirect costs.",
    mode: "study",
    category: "Accounts"
  },
  {
    title: "Companies Act: Auditor Rotation ⚖️",
    prompt: "Explain the provisions of Section 139 of the Companies Act, 2013 regarding rotation of individual and firm auditors. Keep it simple and easy to remember.",
    mode: "study",
    category: "Law"
  },
  {
    title: "Audit: Risk of Material Misstatement 📋",
    prompt: "What is Risk of Material Misstatement (RMM) and how does it relate to Inherent Risk, Control Risk, and Detection Risk under SA 200 series? Keep it direct.",
    mode: "qa",
    category: "Audit"
  },
  {
    title: "Active Recall: AS 10 quiz 🧠",
    prompt: "Start an active recall quiz on AS 10 Valuation of Inventory and PPE. Ask me a scenario-based question to test my understanding.",
    mode: "recall",
    category: "Quiz"
  },
  {
    title: "SA 500 Audit Evidence Checklist 💼",
    prompt: "Provide a quick summary of the requirements of SA 500 regarding audit evidence. What is sufficient and appropriate audit evidence?",
    mode: "qa",
    category: "Audit"
  }
];

export const DEFAULT_PROFILE: UserMemoryProfile = {
  weakAreas: [],
  strengths: [],
  preferredLanguage: "English & Tamil (Tanglish)",
  lastTopic: "None yet",
  notes: "The user is studying for their CA Intermediate course. They want detailed answers, helpful section citations, and love interactive evaluation of their handwritten answers."
};
