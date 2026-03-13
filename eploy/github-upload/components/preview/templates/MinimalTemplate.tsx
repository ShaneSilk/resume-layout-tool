import { ResumeDocument } from "@/types/resume";
import { contactValues, nonEmptySection, renderRecords, renderSection, splitSummary } from "./TemplateCommon";

interface MinimalTemplateProps {
  document: ResumeDocument;
}

export function MinimalTemplate({ document }: MinimalTemplateProps) {
  const contacts = contactValues(document.contacts);
  const sections = nonEmptySection(document);

  return (
    <div className="resume-paper border border-slate-200 px-9 py-8 text-slate-900">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight">{document.name || "你的姓名"}</h1>
          {document.objective ? <p className="mt-2 text-sm text-slate-600">{document.objective}</p> : null}
        </div>
        {contacts.length > 0 && <p className="text-right text-xs leading-5 text-slate-500">{contacts.join(" · ")}</p>}
      </header>

      <div className="mt-6 grid gap-6">
        {document.summary &&
          renderSection(
            "SUMMARY",
            <div className="space-y-2 text-sm leading-7 text-slate-700">
              {splitSummary(document.summary).map((line, idx) => (
                <p key={`summary-${idx}`}>{line}</p>
              ))}
            </div>,
          )}

        {sections.experience && renderSection("EXPERIENCE", renderRecords(document.experience))}
        {sections.projects && renderSection("PROJECTS", renderRecords(document.projects))}
        {sections.education && renderSection("EDUCATION", renderRecords(document.education))}

        {sections.skills &&
          renderSection(
            "SKILLS",
            <p className="text-sm leading-7 text-slate-700">{document.skills.join(" / ")}</p>,
          )}

        {sections.awards &&
          renderSection(
            "AWARDS",
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
              {document.awards.map((award, idx) => (
                <li key={`award-${idx}`}>{award}</li>
              ))}
            </ul>,
          )}
      </div>
    </div>
  );
}
