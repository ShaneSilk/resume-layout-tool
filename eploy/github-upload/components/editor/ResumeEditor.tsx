import type { ReactNode } from "react";
import { createEmptyRecordItem } from "@/lib/defaults";
import { fromLineArray, swapItems, toLineArray } from "@/lib/utils";
import { ResumeDocument, ResumeRecordItem } from "@/types/resume";

interface ResumeEditorProps {
  document: ResumeDocument;
  onChange: (next: ResumeDocument) => void;
}

type RecordCollectionKey = "education" | "experience" | "projects";
type StringCollectionKey = "skills" | "awards";

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <details open className="rounded-xl border border-slate-200 bg-white">
      <summary className="cursor-pointer list-none border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
        {title}
      </summary>
      <div className="space-y-3 p-4">{children}</div>
    </details>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-widest text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function inputClassName() {
  return "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring";
}

function textareaClassName() {
  return `${inputClassName()} resize-y`;
}

interface RecordListEditorProps {
  title: string;
  items: ResumeRecordItem[];
  onChange: (next: ResumeRecordItem[]) => void;
}

function RecordListEditor({ title, items, onChange }: RecordListEditorProps) {
  const updateItem = (index: number, key: keyof ResumeRecordItem, value: string | string[]) => {
    const next = items.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return item;
      }
      return {
        ...item,
        [key]: value,
      };
    });

    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    onChange(swapItems(items, index, target));
  };

  const addItem = () => {
    onChange([...items, createEmptyRecordItem()]);
  };

  return (
    <SectionCard title={title}>
      {items.length === 0 && <p className="text-xs text-slate-500">暂无内容，点击下方按钮添加。</p>}

      {items.map((item, index) => (
        <div key={item.id} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => moveItem(index, "up")}
              className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              上移
            </button>
            <button
              type="button"
              onClick={() => moveItem(index, "down")}
              className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              下移
            </button>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
            >
              删除
            </button>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <Field label="时间">
              <input value={item.period} onChange={(event) => updateItem(index, "period", event.target.value)} className={inputClassName()} />
            </Field>
            <Field label="地点">
              <input value={item.location} onChange={(event) => updateItem(index, "location", event.target.value)} className={inputClassName()} />
            </Field>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <Field label="主标题">
              <input value={item.title} onChange={(event) => updateItem(index, "title", event.target.value)} className={inputClassName()} />
            </Field>
            <Field label="副标题">
              <input value={item.subtitle} onChange={(event) => updateItem(index, "subtitle", event.target.value)} className={inputClassName()} />
            </Field>
          </div>

          <Field label="要点（每行一条）">
            <textarea
              value={fromLineArray(item.details)}
              onChange={(event) => updateItem(index, "details", toLineArray(event.target.value))}
              rows={4}
              className={textareaClassName()}
            />
          </Field>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        + 添加条目
      </button>
    </SectionCard>
  );
}

interface StringListEditorProps {
  title: string;
  items: string[];
  onChange: (next: string[]) => void;
}

function StringListEditor({ title, items, onChange }: StringListEditorProps) {
  const updateItem = (index: number, value: string) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    onChange(swapItems(items, index, target));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = () => {
    onChange([...items, ""]);
  };

  return (
    <SectionCard title={title}>
      {items.length === 0 && <p className="text-xs text-slate-500">暂无内容，点击下方按钮添加。</p>}

      {items.map((item, index) => (
        <div key={`${title}-${index}`} className="flex items-center gap-2">
          <input value={item} onChange={(event) => updateItem(index, event.target.value)} className={inputClassName()} />
          <button
            type="button"
            onClick={() => moveItem(index, "up")}
            className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
          >
            上
          </button>
          <button
            type="button"
            onClick={() => moveItem(index, "down")}
            className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
          >
            下
          </button>
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
          >
            删
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        + 添加
      </button>
    </SectionCard>
  );
}

export function ResumeEditor({ document, onChange }: ResumeEditorProps) {
  const patch = (next: Partial<ResumeDocument>) => {
    onChange({ ...document, ...next });
  };

  const patchRecordCollection = (key: RecordCollectionKey, next: ResumeRecordItem[]) => {
    patch({ [key]: next } as Pick<ResumeDocument, RecordCollectionKey>);
  };

  const patchStringCollection = (key: StringCollectionKey, next: string[]) => {
    patch({ [key]: next } as Pick<ResumeDocument, StringCollectionKey>);
  };

  return (
    <div className="space-y-4">
      <SectionCard title="基础信息">
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="姓名">
            <input value={document.name} onChange={(event) => patch({ name: event.target.value })} className={inputClassName()} />
          </Field>
          <Field label="求职意向">
            <input value={document.objective} onChange={(event) => patch({ objective: event.target.value })} className={inputClassName()} />
          </Field>
        </div>

        <Field label="个人总结">
          <textarea value={document.summary} onChange={(event) => patch({ summary: event.target.value })} rows={4} className={textareaClassName()} />
        </Field>
      </SectionCard>

      <SectionCard title="联系方式">
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="电话">
            <input
              value={document.contacts.phone}
              onChange={(event) => patch({ contacts: { ...document.contacts, phone: event.target.value } })}
              className={inputClassName()}
            />
          </Field>
          <Field label="邮箱">
            <input
              value={document.contacts.email}
              onChange={(event) => patch({ contacts: { ...document.contacts, email: event.target.value } })}
              className={inputClassName()}
            />
          </Field>
          <Field label="所在地">
            <input
              value={document.contacts.location}
              onChange={(event) => patch({ contacts: { ...document.contacts, location: event.target.value } })}
              className={inputClassName()}
            />
          </Field>
          <Field label="网站/作品集">
            <input
              value={document.contacts.website}
              onChange={(event) => patch({ contacts: { ...document.contacts, website: event.target.value } })}
              className={inputClassName()}
            />
          </Field>
          <Field label="LinkedIn">
            <input
              value={document.contacts.linkedin}
              onChange={(event) => patch({ contacts: { ...document.contacts, linkedin: event.target.value } })}
              className={inputClassName()}
            />
          </Field>
          <Field label="GitHub">
            <input
              value={document.contacts.github}
              onChange={(event) => patch({ contacts: { ...document.contacts, github: event.target.value } })}
              className={inputClassName()}
            />
          </Field>
        </div>
        <Field label="补充联系方式（每行一条）">
          <textarea
            value={fromLineArray(document.contacts.custom)}
            onChange={(event) => patch({ contacts: { ...document.contacts, custom: toLineArray(event.target.value) } })}
            rows={3}
            className={textareaClassName()}
          />
        </Field>
      </SectionCard>

      <RecordListEditor title="教育经历" items={document.education} onChange={(next) => patchRecordCollection("education", next)} />
      <RecordListEditor title="工作经历" items={document.experience} onChange={(next) => patchRecordCollection("experience", next)} />
      <RecordListEditor title="项目经历" items={document.projects} onChange={(next) => patchRecordCollection("projects", next)} />

      <StringListEditor title="技能" items={document.skills} onChange={(next) => patchStringCollection("skills", next)} />
      <StringListEditor title="证书 / 奖项" items={document.awards} onChange={(next) => patchStringCollection("awards", next)} />
    </div>
  );
}
