import { ResumeDocument } from "@/types/resume";
import { contactValues, nonEmptySection, renderRecords, renderSection, splitSummary } from "./TemplateCommon";

interface BusinessTemplateProps {
  document: ResumeDocument;
}

export function BusinessTemplate({ document }: BusinessTemplateProps) {
  const contacts = contactValues(document.contacts);
  const sections = nonEmptySection(document);

  return (
    <div className="resume-paper border border-slate-200 p-10 text-slate-900">
      <header className="border-b border-slate-300 pb-5">
        <h1 className="text-3xl font-bold tracking-[0.08em]">{document.name || "你的姓名"}</h1>
        {document.objective ? <p className="mt-2 text-sm tracking-wide text-slate-600">求职意向：{document.objective}</p> : null}
        {contacts.length > 0 ? (
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            {contacts.map((item, idx) => (
              <span key={`contact-${idx}`}>{item}</span>
            ))}
          </p>
        ) : null}
      </header>

      <div className="mt-6 space-y-7">
        {document.summary &&
          renderSection(
            "个人总结",
            <div className="space-y-2 text-sm leading-7 text-slate-700">
              {splitSummary(document.summary).map((line, idx) => (
                <p key={`summary-${idx}`}>{line}</p>
              ))}
            </div>,
          )}

        {sections.experience && renderSection("工作经历", renderRecords(document.experience))}
        {sections.projects && renderSection("项目经历", renderRecords(document.projects))}
        {sections.education && renderSection("教育经历", renderRecords(document.education))}

        {sections.skills &&
          renderSection(
            "技能",
            <div className="flex flex-wrap gap-2 text-sm text-slate-700">
              {document.skills.map((skill, idx) => (
                <span key={`skill-${idx}`} className="rounded border border-slate-300 px-2 py-1">
                  {skill}
                </span>
              ))}
            </div>,
          )}

        {sections.awards &&
          renderSection(
            "证书 / 奖项",
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
