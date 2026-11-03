import React from "react";
import { Modal } from "antd";
import { useTranslations } from "use-intl";

import ProfitLoader from "@/components/ui/profit-loader/profit-loader";
import { UploadDropZone } from "@/components/atoms/UploadDropZone/UploadDropZone";

import styles from "./modalUploadFile.module.scss";

interface ModalUploadFileProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File) => void;
  loading?: boolean;
  title?: string;
  allowedExtensions?: string[];
}

export const ModalUploadFile: React.FC<ModalUploadFileProps> = ({
  isOpen,
  onClose,
  onFileUpload,
  loading = false,
  title,
  allowedExtensions
}) => {
  const tCommon = useTranslations("common");
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={title ?? tCommon("actions.uploadFile")}
      footer={null}
      centered
      closable={!loading}
      maskClosable={!loading}
    >
      <div className={styles.modalBody}>
        <UploadDropZone onFileUpload={onFileUpload} allowedExtensions={allowedExtensions} />

        {loading && (
          <div className={styles.loadingOverlay}>
            <ProfitLoader size="medium" />
          </div>
        )}
      </div>
    </Modal>
  );
};
