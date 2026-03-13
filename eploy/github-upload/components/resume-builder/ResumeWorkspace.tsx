"use client";

import { useEffect, useRef, useState } from "react";
import { InputPanel } from "@/components/editor/InputPanel";
import { ResumeEditor } from "@/components/editor/ResumeEditor";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { exportResumeAsPdf, exportResumeAsPng, printResumeFallback } from "@/lib/exporters";
import { createEmptyParseResult, parseResumeText } from "@/lib/parser";
import { TemplateId } from "@/types/resume";

const TEMPLATE_OPTIONS: Array<{ id: TemplateId; label: string }> = [
  { id: "business", label: "商务正式" },
  { id: "minimal", label: "极简现代" },
  { id: "premium", label: "轻设计高级" },
];

function nowLabel(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

export function ResumeWorkspace() {
  const previewRef = useRef<HTMLDivElement>(null);

  const [rawText, setRawText] = useState("");
  const [parseResult, setParseResult] = useState(createEmptyParseResult());
  const [document, setDocument] = useState(parseResult.document);
  const [templateId, setTemplateId] = useState<TemplateId>("business");
  const [parseStatus, setParseStatus] = useState("等待粘贴简历文本");
  const [actionStatus, setActionStatus] = useState("");
  const [isExporting, setIsExporting] = useState<"pdf" | "png" | null>(null);

  const runParse = (text: string, triggerLabel: string) => {
    const result = parseResumeText(text);
    setParseResult(result);
    setDocument(result.document);
    setParseStatus(`${triggerLabel}（${nowLabel()}）`);
  };

  useEffect(() => {
    if (!rawText.trim()) {
      const empty = createEmptyParseResult();
      setParseResult(empty);
      setDocument(empty.document);
      setParseStatus("等待粘贴简历文本");
      return;
    }

    const timer = window.setTimeout(() => {
      runParse(rawText, "自动识别完成");
    }, 650);

    return () => {
      window.clearTimeout(timer);
    };
  }, [rawText]);

  const handleParseNow = () => {
    if (!rawText.trim()) {
      setActionStatus("请先粘贴简历原文。");
      return;
    }
    runParse(rawText, "手动重新识别完成");
    setActionStatus("识别结果已刷新。");
  };

  const handleExportPdf = async () => {
    if (!previewRef.current) {
      setActionStatus("预览区域未就绪，暂时无法导出。");
      return;
    }

    try {
      setIsExporting("pdf");
      setActionStatus("正在导出 PDF...");
      await exportResumeAsPdf(previewRef.current, {
        format: "pdf",
        page: "A4",
        scale: 2,
      });
      setActionStatus("PDF 导出完成。");
    } catch (error) {
      setActionStatus(`PDF 导出失败：${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPng = async () => {
    if (!previewRef.current) {
      setActionStatus("预览区域未就绪，暂时无法导出。");
      return;
    }

    try {
      setIsExporting("png");
      setActionStatus("正在导出 PNG...");
      await exportResumeAsPng(previewRef.current, {
        format: "png",
        page: "A4",
        scale: 2,
      });
      setActionStatus("PNG 导出完成。");
    } catch (error) {
      setActionStatus(`PNG 导出失败：${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsExporting(null);
    }
  };

  const handlePrint = () => {
    setActionStatus("已触发浏览器打印，可保存为 PDF。");
    printResumeFallback();
  };

  return (
    <div className="mx-auto max-w-[1720px] space-y-4">
      <header className="no-print rounded-xl border border-slate-200 bg-white px-5 py-4">
        <h1 className="text-xl font-semibold text-slate-900">简历排版工具 MVP</h1>
        <p className="mt-1 text-sm text-slate-600">粘贴原文自动识别，实时预览三套模板，支持 PDF/PNG 导出。</p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(430px,1fr)_minmax(0,1.25fr)]">
        <aside className="no-print space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">模板与导出</h2>
              <p className="text-xs text-slate-500">{actionStatus || "请选择模板并导出"}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {TEMPLATE_OPTIONS.map((option) => {
                const active = option.id === templateId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTemplateId(option.id)}
                    className={`rounded-md px-3 py-1.5 text-sm transition ${
                      active ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting !== null}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting === "pdf" ? "导出中..." : "导出 PDF"}
              </button>
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExporting !== null}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting === "png" ? "导出中..." : "导出 PNG"}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                打印兜底
              </button>
            </div>
          </section>

          <InputPanel
            rawText={rawText}
            onRawTextChange={setRawText}
            onParseNow={handleParseNow}
            parseResult={parseResult}
            parseStatus={parseStatus}
          />

          <ResumeEditor document={document} onChange={setDocument} />
        </aside>

        <section className="rounded-xl border border-slate-200 bg-slate-100 p-3 lg:p-5">
          <ResumePreview document={document} templateId={templateId} ref={previewRef} />
        </section>
      </div>
    </div>
  );
}
