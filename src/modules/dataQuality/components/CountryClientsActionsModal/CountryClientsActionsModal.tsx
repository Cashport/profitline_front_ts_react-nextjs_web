import React from "react";
import { Modal } from "antd";
import { DownloadSimple, UploadSimple, EnvelopeSimple } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./countryClientsActionsModal.scss";

type CountryClientsActionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownloadCatalog: () => void;
  onDownloadPointsOfSale: () => void;
  isDownloadPointsOfSaleLoading: boolean;
  onUploadFile?: () => void;
  onUploadMaterialsAuxiliary?: () => void;
  onUploadPointsOfSale?: () => void;
  onAddEmails?: () => void;
  isDownloadCatalogLoading: boolean;
  isInDetailView?: boolean;
};

export const CountryClientsActionsModal: React.FC<CountryClientsActionsModalProps> = ({
  isOpen,
  onClose,
  onDownloadCatalog,
  onDownloadPointsOfSale,
  isDownloadPointsOfSaleLoading,
  onUploadFile,
  onUploadMaterialsAuxiliary,
  onUploadPointsOfSale,
  onAddEmails,
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
          icon={<DownloadSimple size={20} />}
          title="Descargar Puntos de venta"
          onClick={onDownloadPointsOfSale}
          disabled={isDownloadPointsOfSaleLoading}
        />
        <ButtonGenerateAction
          icon={<UploadSimple size={20} />}
          title="Cargar Puntos de venta"
          onClick={onUploadPointsOfSale}
          disabled={isDownloadPointsOfSaleLoading}
        />
        {onAddEmails && (
          <ButtonGenerateAction
            icon={<EnvelopeSimple size={20} />}
            title="Agregar correos"
            onClick={onAddEmails}
          />
        )}
      </div>
    </Modal>
  );
};
