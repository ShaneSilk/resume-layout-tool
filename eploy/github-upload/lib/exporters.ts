"use client";

import { ExportOptions } from "@/types/resume";

function triggerDownload(href: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("无法生成导出文件"));
      }
    }, "image/png");
  });
}

async function captureCanvas(element: HTMLElement, scale: number) {
  const html2canvas = (await import("html2canvas")).default;

  return html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });
}

export async function exportResumeAsPng(element: HTMLElement, options?: Partial<ExportOptions>) {
  const scale = options?.scale ?? 2;
  const canvas = await captureCanvas(element, scale);
  const blob = await toBlob(canvas);
  const href = URL.createObjectURL(blob);

  try {
    triggerDownload(href, "resume.png");
  } finally {
    URL.revokeObjectURL(href);
  }
}

export async function exportResumeAsPdf(element: HTMLElement, options?: Partial<ExportOptions>) {
  const scale = options?.scale ?? 2;
  const canvas = await captureCanvas(element, scale);
  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const margin = 10;
  const printableWidth = 210 - margin * 2;
  const printableHeight = 297 - margin * 2;
  const imageHeight = (canvas.height * printableWidth) / canvas.width;

  let remainingHeight = imageHeight;
  let offsetY = margin;

  pdf.addImage(imgData, "PNG", margin, offsetY, printableWidth, imageHeight, undefined, "FAST");
  remainingHeight -= printableHeight;

  while (remainingHeight > 0) {
    pdf.addPage();
    offsetY = margin - (imageHeight - remainingHeight);
    pdf.addImage(imgData, "PNG", margin, offsetY, printableWidth, imageHeight, undefined, "FAST");
    remainingHeight -= printableHeight;
  }

  pdf.save("resume.pdf");
}

export function printResumeFallback() {
  window.print();
}
