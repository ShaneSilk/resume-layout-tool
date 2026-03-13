import type { ReactNode } from "react";
import { ResumeContact, ResumeDocument, ResumeRecordItem } from "@/types/resume";

export function contactValues(contacts: ResumeContact): string[] {
  return [
    contacts.phone,
    contacts.email,
    contacts.location,
    contacts.website,
    contacts.linkedin,
    contacts.github,
    ...contacts.custom,
  ].filter(Boolean);
}

export function hasContent(values: string[] | ResumeRecordItem[]): boolean {
  return values.length > 0;
}

export function renderSection(title: string, children: ReactNode, className = ""): ReactNode {
  return (
    <section className={className}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">{title}</h2>
      {children}
    </section>
  );
}

export function renderRecords(items: ResumeRecordItem[]): ReactNode {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="break-inside-avoid space-y-1">
          <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-[15px] font-semibold text-slate-900">{item.title || "未命名"}</h3>
            {item.period ? <span className="text-xs tracking-wide text-slate-500">{item.period}</span> : null}
          </header>
          {(item.subtitle || item.location) && <p className="text-sm text-slate-600">{[item.subtitle, item.location].filter(Boolean).join(" | ")}</p>}
          {item.details.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
              {item.details.map((detail, idx) => (
                <li key={`${item.id}-${idx}`}>{detail}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}

export function splitSummary(summary: string): string[] {
  return summary
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function nonEmptySection(document: ResumeDocument) {
  return {
    education: hasContent(document.education),
    experience: hasContent(document.experience),
    projects: hasContent(document.projects),
    skills: hasContent(document.skills),
    awards: hasContent(document.awards),
  };
}
