import React, { Dispatch, SetStateAction } from "react";
import { Modal } from "antd";
import { useTranslations } from "use-intl";

import { useAdaptiveImageModalWidth } from "@/components/molecules/modals/FileDownloadModal/useAdaptiveImageModalWidth";

interface InvoiceDownloadModalProps {
  isModalOpen: boolean;
  handleCloseModal: Dispatch<SetStateAction<boolean>>;
  url?: string;
  title?: string;
}

const InvoiceDownloadModal: React.FC<InvoiceDownloadModalProps> = ({
  isModalOpen,
  url,
  handleCloseModal,
  title
}) => {
  const t = useTranslations("clients.invoiceDownload");
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
          <button type="button" className="button-check" onClick={() => handleCloseModal(false)}>
            {t("gotIt")}
          </button>
        </div>
      }
      onCancel={() => handleCloseModal(false)}
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

export default InvoiceDownloadModal;
