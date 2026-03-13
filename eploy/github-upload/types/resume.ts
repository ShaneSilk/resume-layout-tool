export type TemplateId = "business" | "minimal" | "premium";

export type ResumeSectionKey =
  | "name"
  | "contacts"
  | "objective"
  | "summary"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "awards";

export interface ResumeContact {
  phone: string;
  email: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  custom: string[];
}

export interface ResumeRecordItem {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  location: string;
  details: string[];
}

export interface ResumeDocument {
  name: string;
  objective: string;
  summary: string;
  contacts: ResumeContact;
  education: ResumeRecordItem[];
  experience: ResumeRecordItem[];
  projects: ResumeRecordItem[];
  skills: string[];
  awards: string[];
}

export interface ParseResult {
  document: ResumeDocument;
  confidenceBySection: Record<ResumeSectionKey, number>;
  unmatchedBlocks: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: "pdf" | "png";
  scale: number;
  page: "A4";
}
