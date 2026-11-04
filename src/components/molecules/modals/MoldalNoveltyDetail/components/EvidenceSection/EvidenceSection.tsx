import React, { useState } from "react";
import { IconLabel } from "@/components/atoms/IconLabel/IconLabel";
import { FileText, PaperclipHorizontal } from "phosphor-react";
import { Typography, Tag } from "antd";
import { useTranslations } from "use-intl";
import "./evidencesection.scss";
import InvoiceDownloadModal from "@/modules/clients/components/invoice-download-modal";

const { Paragraph } = Typography;

interface EvidenceSectionProps {
  evidenceComments: string;
  evidenceFiles: string[];
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  evidenceComments,
  evidenceFiles
}) => {
  const t = useTranslations("modals.noveltyDetail.evidence");
  const [urlStep, setUrlStep] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDocumentClick = (documentUrl: string) => {
    const fileExtension = documentUrl?.split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg"].includes(fileExtension)) {
      setUrlStep(documentUrl);
      if (isModalOpen === false) setIsModalOpen(true);
    } else {
      window.open(documentUrl, "_blank");
    }
  };

  return (
    <div className="evidence-section">
      <IconLabel icon={<FileText size={20} />} text={t("title")} />
      <div className="evidence-content">
        <Paragraph>{evidenceComments}</Paragraph>
        <div className="attachments">
          {evidenceFiles.map((file, index) => {
            const fileName = extractTextAfterLastSlash(file);
            return (
              <Tag
                key={index}
                icon={<PaperclipHorizontal size={16} />}
                className="attachment-tag"
                onClick={() => handleDocumentClick(file)}
              >
                <p className="fileName">{fileName}</p>
              </Tag>
            );
          })}
        </div>
      </div>
      <InvoiceDownloadModal
        isModalOpen={isModalOpen}
        handleCloseModal={setIsModalOpen}
        url={urlStep}
      />
    </div>
  );
};

const extractTextAfterLastSlash = (url: string): string => {
  const lastSlashIndex = url.lastIndexOf("/");
  return url.slice(lastSlashIndex + 1);
};
