import React, { Dispatch, SetStateAction } from "react";
import { Modal } from "antd";

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
  const { modalWidth, imgRef, onImgLoad } = useAdaptiveImageModalWidth(url, isModalOpen);

  return (
    <Modal
      title={
        title ? (
          <div className="title_modal_file_download">{title}</div>
        ) : (
          <div className="title_modal_file_download">factura</div>
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
            Descargar
          </a>
          <button type="button" className="button-check" onClick={() => handleCloseModal(false)}>
            Entendido
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
            alt="Document"
            onLoad={onImgLoad}
            style={{ visibility: modalWidth ? "visible" : "hidden" }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceDownloadModal;
