import React from "react";
import { Modal } from "antd";
import { useTranslations } from "use-intl";
import "./fileDownloadModal.scss";
import { useAdaptiveImageModalWidth } from "./useAdaptiveImageModalWidth";

interface InvoiceDownloadModalProps {
  isModalOpen: boolean;
  url: string;
  onCloseModal: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
}

export const FileDownloadModal: React.FC<InvoiceDownloadModalProps> = ({
  isModalOpen,
  url,
  onCloseModal,
  title
}) => {
  const t = useTranslations("modals.fileDownload");
  const tCommon = useTranslations("common");
  const { modalWidth, imgRef, onImgLoad } = useAdaptiveImageModalWidth(url, isModalOpen);

  return (
    <Modal
      title={
        title ? (
          <div className="title_modal_file_download">{title}</div>
        ) : (
          <div className="title_modal_file_download">{t("defaultTitle")}</div>
        )
      }
      className="file-download-modal"
      open={isModalOpen}
      centered
      width={modalWidth}
      footer={
        <div className="footer">
          <a
            className="button-download"
            download
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {tCommon("actions.download")}
          </a>
          <button type="button" className="button-check" onClick={() => onCloseModal(false)}>
            {t("gotIt")}
          </button>
        </div>
      }
      onCancel={() => onCloseModal(false)}
    >
      <div className="modal-content">
        <div className="img-container">
          <img
            ref={imgRef}
            src={url}
            alt={t("imageAlt")}
            onLoad={onImgLoad}
            style={{ visibility: modalWidth ? "visible" : "hidden" }}
          />
        </div>
      </div>
    </Modal>
  );
};
