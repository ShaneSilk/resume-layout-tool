import { ForwardedRef, forwardRef } from "react";
import { ResumeDocument, TemplateId } from "@/types/resume";
import { BusinessTemplate } from "./templates/BusinessTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { PremiumTemplate } from "./templates/PremiumTemplate";

interface ResumePreviewProps {
  document: ResumeDocument;
  templateId: TemplateId;
}

function ResumePreviewComponent({ document, templateId }: ResumePreviewProps, ref: ForwardedRef<HTMLDivElement>) {
  const renderTemplate = () => {
    if (templateId === "minimal") {
      return <MinimalTemplate document={document} />;
    }

    if (templateId === "premium") {
      return <PremiumTemplate document={document} />;
    }

    return <BusinessTemplate document={document} />;
  };

  return (
    <div className="print-only-resume mx-auto w-full max-w-[820px] rounded-lg shadow-paper" ref={ref} id="resume-preview-root">
      {renderTemplate()}
    </div>
  );
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(ResumePreviewComponent);
ResumePreview.displayName = "ResumePreview";
