import React from "react";
import { Modal } from "antd";
import { DownloadSimple, UploadSimple } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./countryClientsActionsModal.scss";

type CountryClientsActionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownloadCatalog: () => void;
  isDownloadCatalogLoading: boolean;
  isInDetailView?: boolean;
};

export const CountryClientsActionsModal: React.FC<CountryClientsActionsModalProps> = ({
  isOpen,
  onClose,
  onDownloadCatalog,
  isDownloadCatalogLoading,
  isInDetailView = false
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Selecciona la acción que vas a realizar"
      footer={null}
      onCancel={onClose}
      className="countryClientsActionsModal"
      centered
    >
      <div className="modal-content">
        <ButtonGenerateAction
          icon={<DownloadSimple size={20} />}
          title="Descargar Auxiliar Materiales"
          onClick={onDownloadCatalog}
          disabled={isDownloadCatalogLoading}
        />
        <ButtonGenerateAction
          icon={<UploadSimple size={20} />}
          title="Cargar Auxiliar Materiales"
          onClick={() => {}}
        />
        {!isInDetailView && (
          <ButtonGenerateAction
            icon={<UploadSimple size={20} />}
            title="Cargar Histórico"
            onClick={() => {}}
          />
        )}
      </div>
    </Modal>
  );
};
