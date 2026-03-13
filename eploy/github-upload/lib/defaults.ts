import { ResumeDocument, ResumeRecordItem } from "@/types/resume";
import { createId } from "@/lib/utils";

export function createEmptyRecordItem(): ResumeRecordItem {
  return {
    id: createId(),
    period: "",
    title: "",
    subtitle: "",
    location: "",
    details: [],
  };
}

export function createEmptyDocument(): ResumeDocument {
  return {
    name: "",
    objective: "",
    summary: "",
    contacts: {
      phone: "",
      email: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      custom: [],
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    awards: [],
  };
}
