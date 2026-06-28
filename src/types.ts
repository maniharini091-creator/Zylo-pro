export type ChatMode = "study" | "evaluator" | "qa" | "recall";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string; // base64 encoded string with mime prefix
  attachmentName?: string;
  attachmentType?: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  mode: ChatMode;
  createdAt: string;
  lastActiveAt: string;
}

export interface UserMemoryProfile {
  weakAreas: string[];
  strengths: string[];
  preferredLanguage: string;
  lastTopic: string;
  notes: string;
}

export interface StudyDocument {
  id: string;
  title: string;
  type: "question_paper" | "revision_notes" | "chapter_summary" | "section_citations";
  subject: string;
  topic: string;
  content: string;
  createdAt: string;
}
