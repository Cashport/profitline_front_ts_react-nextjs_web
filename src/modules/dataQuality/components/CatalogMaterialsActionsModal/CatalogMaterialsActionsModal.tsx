import React from "react";
import { Modal } from "antd";
import { DownloadSimple } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./catalogMaterialsActionsModal.scss";

type CatalogMaterialsActionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownloadCatalog: () => void;
  isDownloadCatalogLoading: boolean;
};

export const CatalogMaterialsActionsModal: React.FC<CatalogMaterialsActionsModalProps> = ({
  isOpen,
  onClose,
  onDownloadCatalog,
  isDownloadCatalogLoading
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Selecciona la acción que vas a realizar"
      footer={null}
      onCancel={onClose}
      className="catalogMaterialsActionsModal"
      centered
    >
      <div className="modal-content">
        <ButtonGenerateAction
          icon={<DownloadSimple size={20} />}
          title="Descargar Auxiliar Materiales"
          onClick={onDownloadCatalog}
          disabled={isDownloadCatalogLoading}
        />
      </div>
    </Modal>
  );
};
