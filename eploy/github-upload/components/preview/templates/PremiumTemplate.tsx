import { ResumeDocument } from "@/types/resume";
import { contactValues, nonEmptySection, renderRecords, renderSection, splitSummary } from "./TemplateCommon";

interface PremiumTemplateProps {
  document: ResumeDocument;
}

export function PremiumTemplate({ document }: PremiumTemplateProps) {
  const contacts = contactValues(document.contacts);
  const sections = nonEmptySection(document);

  return (
    <div className="resume-paper overflow-hidden border border-slate-200 bg-white text-slate-900">
      <div className="h-20 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500" />
      <div className="px-10 pb-10 pt-6">
        <header className="-mt-14 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-[30px] font-semibold tracking-tight">{document.name || "你的姓名"}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            {contacts.length > 0 ? contacts.map((item, idx) => <span key={`contact-${idx}`}>{item}</span>) : <span>联系方式待补充</span>}
          </div>
          {document.objective ? <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-700">求职意向：{document.objective}</p> : null}
        </header>

        <div className="mt-7 grid grid-cols-12 gap-6">
          <aside className="col-span-12 space-y-6 lg:col-span-4">
            {document.summary &&
              renderSection(
                "个人总结",
                <div className="space-y-2 text-sm leading-7 text-slate-700">
                  {splitSummary(document.summary).map((line, idx) => (
                    <p key={`summary-${idx}`}>{line}</p>
                  ))}
                </div>,
                "rounded border border-slate-100 p-4",
              )}

            {sections.skills &&
              renderSection(
                "核心技能",
                <ul className="space-y-1 text-sm leading-6 text-slate-700">
                  {document.skills.map((skill, idx) => (
                    <li key={`skill-${idx}`}>• {skill}</li>
                  ))}
                </ul>,
                "rounded border border-slate-100 p-4",
              )}

            {sections.awards &&
              renderSection(
                "证书 / 奖项",
                <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                  {document.awards.map((award, idx) => (
                    <li key={`award-${idx}`}>{award}</li>
                  ))}
                </ul>,
                "rounded border border-slate-100 p-4",
              )}
          </aside>

          <section className="col-span-12 space-y-6 lg:col-span-8">
            {sections.experience && renderSection("工作经历", renderRecords(document.experience), "rounded border border-slate-100 p-4")}
            {sections.projects && renderSection("项目经历", renderRecords(document.projects), "rounded border border-slate-100 p-4")}
            {sections.education && renderSection("教育经历", renderRecords(document.education), "rounded border border-slate-100 p-4")}
          </section>
        </div>
      </div>
    </div>
  );
}
