import { createEmptyDocument, createEmptyRecordItem } from "@/lib/defaults";
import { dedupeStrings, toLineArray } from "@/lib/utils";
import { ParseResult, ResumeDocument, ResumeRecordItem, ResumeSectionKey } from "@/types/resume";

const SECTION_ALIASES: Record<ResumeSectionKey, string[]> = {
  name: ["姓名", "name", "candidate", "应聘者"],
  contacts: ["联系方式", "联系信息", "contact", "contactinfo", "联系"],
  objective: ["求职意向", "求职目标", "objective", "careerobjective", "targetrole"],
  summary: ["个人总结", "个人简介", "自我评价", "summary", "profile", "aboutme"],
  education: ["教育经历", "教育背景", "education", "academicbackground", "educationbackground"],
  experience: ["工作经历", "工作经验", "职业经历", "experience", "workexperience", "employmenthistory"],
  projects: ["项目经历", "项目经验", "projects", "projectexperience", "selectedprojects"],
  skills: ["技能", "专业技能", "skills", "technicalskills", "corecompetencies"],
  awards: ["证书", "证书奖项", "奖项", "荣誉", "certificates", "awards", "honors"],
};

const DATE_PATTERN =
  /((?:19|20)\d{2}(?:[./-](?:0?[1-9]|1[0-2]))?(?:\s*(?:-|–|—|~|至|to)\s*(?:present|current|now|至今|目前|(?:19|20)\d{2}(?:[./-](?:0?[1-9]|1[0-2]))?))?)/i;

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_PATTERN = /(?:\+?\d{1,3}[\s-]?)?(?:1[3-9]\d{9}|\d{3,4}[\s-]?\d{7,8})/;
const URL_PATTERN = /(https?:\/\/[^\s，,;；|]+)/i;

function normalizeHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/^#+\s*/, "")
    .replace(/[：:]/g, "")
    .replace(/[()（）\[\]\-—_·•\s]/g, "");
}

function detectSection(line: string): ResumeSectionKey | null {
  const normalized = normalizeHeading(line);

  const entry = Object.entries(SECTION_ALIASES).find(([, aliases]) => aliases.some((alias) => alias === normalized));
  if (entry) {
    return entry[0] as ResumeSectionKey;
  }

  const englishTitle = line
    .trim()
    .toLowerCase()
    .replace(/[：:]/g, "")
    .replace(/\s+/g, " ");

  if (/^(work|professional) experience$/.test(englishTitle)) {
    return "experience";
  }
  if (/^project(s)?$/.test(englishTitle)) {
    return "projects";
  }
  if (/^education( background| history)?$/.test(englishTitle)) {
    return "education";
  }

  return null;
}

function buildSectionBuckets() {
  return {
    name: [] as string[],
    contacts: [] as string[],
    objective: [] as string[],
    summary: [] as string[],
    education: [] as string[],
    experience: [] as string[],
    projects: [] as string[],
    skills: [] as string[],
    awards: [] as string[],
  };
}

function cleanLine(line: string): string {
  return line
    .replace(/^[-*•·]\s*/, "")
    .replace(/^\d+[.)、]\s*/, "")
    .trim();
}

function chunkByBlankLines(lines: string[]): string[][] {
  const chunks: string[][] = [];
  let current: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.length > 0) {
        chunks.push(current);
        current = [];
      }
      return;
    }

    current.push(cleanLine(trimmed));
  });

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

function parseRecordBlock(block: string[]): ResumeRecordItem {
  const item = createEmptyRecordItem();
  const [firstLine = "", ...rest] = block;

  const periodMatch = firstLine.match(DATE_PATTERN);
  if (periodMatch) {
    item.period = periodMatch[0].trim();
  }

  let header = firstLine.replace(DATE_PATTERN, "").trim();
  if (!header && rest.length > 0) {
    header = rest[0];
  }

  const splitByPipe = header
    .split(/[|｜]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (splitByPipe.length >= 1) {
    item.title = splitByPipe[0] ?? "";
    item.subtitle = splitByPipe[1] ?? "";
    item.location = splitByPipe[2] ?? "";
  } else {
    const splitByDash = header
      .split(/\s+-\s+|\s+—\s+|\s+–\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    item.title = splitByDash[0] ?? "";
    item.subtitle = splitByDash[1] ?? "";
    item.location = splitByDash[2] ?? "";
  }

  item.details = rest.map(cleanLine).filter(Boolean);

  if (!item.title && item.details.length > 0) {
    item.title = item.details.shift() ?? "";
  }

  return item;
}

function parseRecordSection(lines: string[]): ResumeRecordItem[] {
  if (lines.length === 0) {
    return [];
  }

  const blocks = chunkByBlankLines(lines);
  if (blocks.length === 0) {
    return [];
  }

  const items = blocks
    .map(parseRecordBlock)
    .filter((item) => item.title || item.subtitle || item.details.length > 0 || item.period);

  return items;
}

function parseStringSection(lines: string[]): string[] {
  const merged = lines
    .map(cleanLine)
    .join("\n")
    .split(/[\n,，;；、|]/)
    .map((part) => cleanLine(part))
    .filter(Boolean);

  return dedupeStrings(merged);
}

function findLineByPattern(lines: string[], pattern: RegExp): string {
  const target = lines.find((line) => pattern.test(line));
  return target ? cleanLine(target) : "";
}

function extractName(textLines: string[], sectionNameLines: string[]): string {
  if (sectionNameLines.length > 0) {
    return cleanLine(sectionNameLines[0]);
  }

  const namedLine = findLineByPattern(textLines, /(?:姓名|name)\s*[:：]?\s*/i);
  if (namedLine) {
    return namedLine.replace(/(?:姓名|name)\s*[:：]?\s*/i, "").trim();
  }

  const candidate = textLines.find((line) => {
    const value = cleanLine(line);
    if (!value || value.length > 28) {
      return false;
    }
    if (/[0-9@]/.test(value)) {
      return false;
    }
    if (/[：:]/.test(value)) {
      return false;
    }
    return true;
  });

  return candidate ? cleanLine(candidate) : "";
}

function extractContacts(document: ResumeDocument, sourceText: string, contactLines: string[]): void {
  const scope = `${contactLines.join("\n")}\n${sourceText}`;

  const emailMatch = scope.match(EMAIL_PATTERN);
  if (emailMatch) {
    document.contacts.email = emailMatch[0];
  }

  const phoneMatch = scope.match(PHONE_PATTERN);
  if (phoneMatch) {
    document.contacts.phone = phoneMatch[0];
  }

  const urlMatch = scope.match(URL_PATTERN);
  if (urlMatch) {
    document.contacts.website = urlMatch[0];
  }

  const locationLine = findLineByPattern(contactLines, /(地址|所在地|location|city|居住地)/i);
  if (locationLine) {
    document.contacts.location = locationLine.replace(/^(地址|所在地|location|city|居住地)\s*[:：]?\s*/i, "").trim();
  }

  const linkedinLine = findLineByPattern(contactLines, /linkedin/i);
  if (linkedinLine) {
    document.contacts.linkedin = linkedinLine.replace(/^linkedin\s*[:：]?\s*/i, "").trim();
  }

  const githubLine = findLineByPattern(contactLines, /github/i);
  if (githubLine) {
    document.contacts.github = githubLine.replace(/^github\s*[:：]?\s*/i, "").trim();
  }

  const misc = contactLines
    .map(cleanLine)
    .filter((line) => line && !EMAIL_PATTERN.test(line) && !PHONE_PATTERN.test(line) && !/linkedin|github|地址|location|所在地/i.test(line));
  document.contacts.custom = dedupeStrings(misc);
}

function mergeUnmatched(lines: string[]): string[] {
  const chunks = chunkByBlankLines(lines);
  return chunks.map((chunk) => chunk.join("\n")).filter(Boolean);
}

function toConfidence(document: ResumeDocument): Record<ResumeSectionKey, number> {
  return {
    name: document.name ? 0.9 : 0.2,
    contacts: document.contacts.email || document.contacts.phone ? 0.9 : 0.3,
    objective: document.objective ? 0.8 : 0.3,
    summary: document.summary ? 0.85 : 0.3,
    education: document.education.length > 0 ? 0.8 : 0.3,
    experience: document.experience.length > 0 ? 0.8 : 0.3,
    projects: document.projects.length > 0 ? 0.75 : 0.3,
    skills: document.skills.length > 0 ? 0.9 : 0.3,
    awards: document.awards.length > 0 ? 0.8 : 0.3,
  };
}

function toWarnings(document: ResumeDocument, unmatchedBlocks: string[]): string[] {
  const warnings: string[] = [];

  if (!document.name) {
    warnings.push("未识别到姓名，请在左侧手动补充。");
  }

  if (!document.contacts.email && !document.contacts.phone) {
    warnings.push("未识别到邮箱或电话，请检查联系方式。");
  }

  if (unmatchedBlocks.length > 0) {
    warnings.push("存在未归类内容，建议在结构化编辑区手动整理。");
  }

  return warnings;
}

export function parseResumeText(rawText: string): ParseResult {
  const document = createEmptyDocument();
  const lines = rawText.split(/\r?\n/);
  const buckets = buildSectionBuckets();
  const unmatchedLines: string[] = [];

  let currentSection: ResumeSectionKey | null = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const section = detectSection(trimmed);

    if (section) {
      currentSection = section;
      return;
    }

    if (!trimmed) {
      if (currentSection) {
        buckets[currentSection].push("");
      } else {
        unmatchedLines.push("");
      }
      return;
    }

    if (currentSection) {
      buckets[currentSection].push(trimmed);
    } else {
      unmatchedLines.push(trimmed);
    }
  });

  const allLines = toLineArray(rawText);
  document.name = extractName(allLines, buckets.name);
  document.objective = buckets.objective.map(cleanLine).filter(Boolean).join("\n");
  document.summary = buckets.summary.map(cleanLine).filter(Boolean).join("\n");

  extractContacts(document, rawText, buckets.contacts);

  document.education = parseRecordSection(buckets.education);
  document.experience = parseRecordSection(buckets.experience);
  document.projects = parseRecordSection(buckets.projects);
  document.skills = parseStringSection(buckets.skills);
  document.awards = parseStringSection(buckets.awards);

  if (!document.objective) {
    const objectiveLine = findLineByPattern(unmatchedLines, /(求职意向|objective|target role)/i);
    if (objectiveLine) {
      document.objective = objectiveLine.replace(/(求职意向|objective|target role)\s*[:：]?\s*/i, "").trim();
    }
  }

  if (!document.summary) {
    const summaryChunk = mergeUnmatched(unmatchedLines)
      .find((chunk) => chunk.length > 20 && !/(phone|email|联系方式|教育|工作|项目|skills)/i.test(chunk));
    if (summaryChunk) {
      document.summary = summaryChunk;
    }
  }

  const unmatchedBlocks = mergeUnmatched(unmatchedLines)
    .filter((chunk) => chunk !== document.name && chunk !== document.summary);

  const confidenceBySection = toConfidence(document);
  const warnings = toWarnings(document, unmatchedBlocks);

  return {
    document,
    confidenceBySection,
    unmatchedBlocks,
    warnings,
  };
}

export function createEmptyParseResult(): ParseResult {
  const document = createEmptyDocument();
  return {
    document,
    confidenceBySection: toConfidence(document),
    unmatchedBlocks: [],
    warnings: [],
  };
}
