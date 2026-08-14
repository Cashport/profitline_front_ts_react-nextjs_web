import React from "react";
import { Modal } from "antd";
import { DownloadSimple, UploadSimple, EnvelopeSimple } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./countryClientsActionsModal.scss";

type CountryClientsActionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownloadCatalog: () => void;
  isDownloadCatalogLoading: boolean;
  onUploadFile?: () => void;
  onUploadMaterialsAuxiliary?: () => void;
  onUploadPointsOfSale?: () => void;
  onUploadPacks?: () => void;
  onAddEmails?: () => void;
  isInDetailView?: boolean;
};

export const CountryClientsActionsModal: React.FC<CountryClientsActionsModalProps> = ({
  isOpen,
  onClose,
  onDownloadCatalog,
  isDownloadCatalogLoading,
  onUploadFile,
  onUploadMaterialsAuxiliary,
  onUploadPointsOfSale,
  onUploadPacks,
  onAddEmails,
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
          title="Descargar catálogo"
          onClick={onDownloadCatalog}
          disabled={isDownloadCatalogLoading}
        />
        <ButtonGenerateAction
          icon={<UploadSimple size={20} />}
          title="Cargar Auxiliar Materiales"
          onClick={onUploadMaterialsAuxiliary}
        />
        {isInDetailView && (
          <ButtonGenerateAction
            icon={<UploadSimple size={20} />}
            title="Cargar Histórico"
            onClick={onUploadFile}
          />
        )}
        <ButtonGenerateAction
          icon={<UploadSimple size={20} />}
          title="Cargar Puntos de venta"
          onClick={onUploadPointsOfSale}
        />
        <ButtonGenerateAction
          icon={<UploadSimple size={20} />}
          title="Cargar Packs"
          onClick={onUploadPacks}
        />
        {onAddEmails && (
          <ButtonGenerateAction
            icon={<EnvelopeSimple size={20} />}
            title="Editar reglas de correo"
            onClick={onAddEmails}
          />
        )}
      </div>
    </Modal>
  );
};
