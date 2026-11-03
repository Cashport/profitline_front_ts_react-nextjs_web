/* eslint-disable no-unused-vars */
import React from "react";
import { Button, Flex, UploadFile } from "antd";
import { useTranslations } from "use-intl";
import { CaretLeft, Plus } from "@phosphor-icons/react";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import styles from "./wallet-tab-evidence-modal.module.scss";
import { UploadChangeParam } from "antd/es/upload";

type EvidenceModalProps = {
  selectedEvidence: File[];
  handleOnChangeDocument: (info: UploadChangeParam<UploadFile<any>>) => void;
  handleOnDeleteDocument: (fileName: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOnChangeTextArea: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleAttachEvidence: () => void;
  commentary?: string;
  setIsSecondView: React.Dispatch<React.SetStateAction<boolean>>;
  noComment?: boolean;
  isSubmitting?: boolean;
};

const EvidenceModal = ({
  selectedEvidence,
  handleOnChangeDocument,
  handleOnDeleteDocument,
  handleFileChange,
  handleOnChangeTextArea,
  handleAttachEvidence,
  commentary,
  setIsSecondView,
  isSubmitting,
  noComment = false
}: EvidenceModalProps) => {
  const t = useTranslations("clients.evidence");
  const tCommon = useTranslations("common");
  const isAttachButtonDisabled = !noComment
    ? !(commentary && selectedEvidence.length > 0)
    : selectedEvidence.length === 0;

  return (
    <div className={styles.content}>
      <button className={styles.content__header} onClick={() => setIsSecondView(false)}>
        <CaretLeft size={"1.25rem"} />
        <h4>{t("title")}</h4>
      </button>
      <p className={styles.content__description}>{t("description")}</p>
      <div className={styles.content__evidence}>
        <Flex vertical>
          <p>{t("title")}</p>
          <em className="descriptionDocument">{t("required")}</em>
        </Flex>
        <DocumentButton
          title={selectedEvidence[0]?.name}
          handleOnChange={handleOnChangeDocument}
          handleOnDelete={() => handleOnDeleteDocument(selectedEvidence[0]?.name)}
          fileName={selectedEvidence[0]?.name}
          fileSize={selectedEvidence[0]?.size}
        />
        {selectedEvidence.length > 0 &&
          selectedEvidence
            .slice(1)
            .map((file) => (
              <DocumentButton
                key={file.name}
                className={styles.documentButton}
                title={file.name}
                handleOnChange={handleOnChangeDocument}
                handleOnDelete={() => handleOnDeleteDocument(file.name)}
                fileName={file.name}
                fileSize={file.size}
              />
            ))}
        {selectedEvidence.length > 0 && (
          <>
            <Button
              onClick={() => {
                const fileInput = document.getElementById("fileInput");
                if (fileInput) {
                  fileInput.click();
                }
              }}
              className={styles.addDocument}
              icon={<Plus size={"1rem"} />}
            >
              <p>{t("uploadAnother")}</p>
            </Button>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept=".pdf, .png, .doc, .docx, .xls, .xlsx, .msg, .txt, .eml"
            />
          </>
        )}

        <p>{tCommon("fields.comments")}</p>
        <textarea onChange={handleOnChangeTextArea} placeholder={t("commentPlaceholder")} />
      </div>
      <div className={styles.footer}>
        <Button className={styles.cancelButton} onClick={() => setIsSecondView(false)}>
          {tCommon("actions.cancel")}
        </Button>
        <Button
          onClick={handleAttachEvidence}
          disabled={isAttachButtonDisabled || isSubmitting}
          className={styles.acceptButton}
        >
          {isSubmitting ? tCommon("status.sending") : t("attach")}
        </Button>
      </div>
    </div>
  );
};

export default EvidenceModal;
