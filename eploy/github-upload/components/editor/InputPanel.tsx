import { ParseResult, ResumeSectionKey } from "@/types/resume";

interface InputPanelProps {
  rawText: string;
  onRawTextChange: (value: string) => void;
  onParseNow: () => void;
  parseResult: ParseResult;
  parseStatus: string;
}

const SECTION_LABEL: Record<ResumeSectionKey, string> = {
  name: "姓名",
  contacts: "联系方式",
  objective: "求职意向",
  summary: "个人总结",
  education: "教育经历",
  experience: "工作经历",
  projects: "项目经历",
  skills: "技能",
  awards: "证书/奖项",
};

function ConfidenceItem({ label, value }: { label: string; value: number }) {
  const percent = Math.round(value * 100);
  const tone = percent >= 80 ? "bg-emerald-500" : percent >= 60 ? "bg-amber-500" : "bg-slate-400";

  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded bg-slate-200">
        <div className={`${tone} h-full rounded`} style={{ width: `${percent}%` }} />
      </div>
    </li>
  );
}

export function InputPanel({ rawText, onRawTextChange, onParseNow, parseResult, parseStatus }: InputPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">原文输入</h2>
          <p className="mt-1 text-xs text-slate-500">支持中文/英文简历文本粘贴，自动结构识别。</p>
        </div>
        <button
          type="button"
          onClick={onParseNow}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          重新识别
        </button>
      </div>

      <textarea
        value={rawText}
        onChange={(event) => onRawTextChange(event.target.value)}
        placeholder="请粘贴 AI 生成的简历原文..."
        className="mt-3 h-52 w-full resize-y rounded-md border border-slate-300 bg-white p-3 text-sm leading-6 outline-none ring-blue-500 transition focus:ring"
      />

      <p className="mt-2 text-xs text-slate-500">{parseStatus}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-600">识别置信度</h3>
          <ul className="mt-2 space-y-2">
            {Object.entries(parseResult.confidenceBySection).map(([section, value]) => (
              <ConfidenceItem key={section} label={SECTION_LABEL[section as ResumeSectionKey]} value={value} />
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-600">识别提醒</h3>
            {parseResult.warnings.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-amber-700">
                {parseResult.warnings.map((warning, idx) => (
                  <li key={`warning-${idx}`}>{warning}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-slate-500">暂无提醒</p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-600">未归类内容</h3>
            {parseResult.unmatchedBlocks.length > 0 ? (
              <ul className="mt-2 space-y-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-2">
                {parseResult.unmatchedBlocks.map((block, idx) => (
                  <li key={`unmatched-${idx}`} className="text-xs leading-5 text-slate-600">
                    {block}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-slate-500">未发现未归类内容</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
