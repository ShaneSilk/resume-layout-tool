export function cn(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

export function toLineArray(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function fromLineArray(lines: string[]): string {
  return lines.join("\n");
}

export function swapItems<T>(items: T[], sourceIndex: number, targetIndex: number): T[] {
  if (targetIndex < 0 || targetIndex >= items.length || sourceIndex === targetIndex) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function dedupeStrings(values: string[]): string[] {
  const set = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }

    const key = normalized.toLowerCase();
    if (set.has(key)) {
      return;
    }

    set.add(key);
    result.push(normalized);
  });

  return result;
}
