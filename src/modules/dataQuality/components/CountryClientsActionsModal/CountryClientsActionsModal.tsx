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
  onDownloadIqviaCatalog?: () => void;
  isDownloadIqviaCatalogLoading?: boolean;
  onUploadIqviaCatalog?: () => void;
  onDownloadIqviaProductCatalog?: () => void;
  isDownloadIqviaProductCatalogLoading?: boolean;
  onUploadIqviaProductCatalog?: () => void;
  onUploadMaterialsAuxiliary?: () => void;
  onUploadPointsOfSale?: () => void;
  onDownloadMaterials?: () => void;
  onDownloadPointsOfSale?: () => void;
  onUploadPacks?: () => void;
  onUploadGmnOficiales?: () => void;
  onUploadInTransitHaleon?: () => void;
  onAddEmails?: () => void;
  isInDetailView?: boolean;
  downloadCatalogOnly?: boolean;
  /** Deja en el modal únicamente la acción "Cargar Maestra Productos". */
  onlyGmnOficiales?: boolean;
};

export const CountryClientsActionsModal: React.FC<CountryClientsActionsModalProps> = ({
  isOpen,
  onClose,
  onDownloadCatalog,
  isDownloadCatalogLoading,
  onUploadFile,
  onDownloadIqviaCatalog,
  isDownloadIqviaCatalogLoading = false,
  onUploadIqviaCatalog,
  onDownloadIqviaProductCatalog,
  isDownloadIqviaProductCatalogLoading = false,
  onUploadIqviaProductCatalog,
  onUploadMaterialsAuxiliary,
  onUploadPointsOfSale,
  onDownloadMaterials,
  onDownloadPointsOfSale,
  onUploadPacks,
  onUploadGmnOficiales,
  onUploadInTransitHaleon,
  onAddEmails,
  isInDetailView = false,
  downloadCatalogOnly = false,
  onlyGmnOficiales = false
}) => {
  const gmnOficialesButton = onUploadGmnOficiales ? (
    <ButtonGenerateAction
      icon={<UploadSimple size={20} />}
      title="Cargar Maestra Productos"
      onClick={onUploadGmnOficiales}
    />
  ) : null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        onlyGmnOficiales ? "Cargar Maestra Productos" : "Selecciona la acción que vas a realizar"
      }
      footer={null}
      onCancel={onClose}
      className="countryClientsActionsModal"
      centered
    >
      <div className="modal-content">
        {onlyGmnOficiales && gmnOficialesButton}
        {!onlyGmnOficiales && (
          <>
        <ButtonGenerateAction
          icon={<DownloadSimple size={20} />}
          title="Descargar catálogo"
          onClick={onDownloadCatalog}
          disabled={isDownloadCatalogLoading}
        />
        {onDownloadIqviaCatalog && (
          <ButtonGenerateAction
            icon={<DownloadSimple size={20} />}
            title="Descargar catálogo IQVIA Clientes"
            onClick={onDownloadIqviaCatalog}
            disabled={isDownloadIqviaCatalogLoading}
          />
        )}
        {onDownloadIqviaProductCatalog && (
          <ButtonGenerateAction
            icon={<DownloadSimple size={20} />}
            title="Descargar catálogo IQVIA Productos"
            onClick={onDownloadIqviaProductCatalog}
            disabled={isDownloadIqviaProductCatalogLoading}
          />
        )}
          </>
        )}
        {!downloadCatalogOnly && !onlyGmnOficiales && (
          <>
            {onUploadIqviaCatalog && (
              <ButtonGenerateAction
                icon={<UploadSimple size={20} />}
                title="Cargar catálogo IQVIA Clientes"
                onClick={onUploadIqviaCatalog}
              />
            )}
            {onUploadIqviaProductCatalog && (
              <ButtonGenerateAction
                icon={<UploadSimple size={20} />}
                title="Cargar catálogo IQVIA Productos"
                onClick={onUploadIqviaProductCatalog}
              />
            )}
            {onDownloadMaterials && (
              <ButtonGenerateAction
                icon={<DownloadSimple size={20} />}
                title="Descargar Auxiliar Materiales"
                onClick={onDownloadMaterials}
              />
            )}
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
            {onDownloadPointsOfSale && (
              <ButtonGenerateAction
                icon={<DownloadSimple size={20} />}
                title="Descargar Puntos de venta"
                onClick={onDownloadPointsOfSale}
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
            {gmnOficialesButton}
            {isInDetailView && (
              <ButtonGenerateAction
                icon={<UploadSimple size={20} />}
                title='Cargar "In-Transit Haleon"'
                onClick={onUploadInTransitHaleon}
              />
            )}
            {onAddEmails && (
              <ButtonGenerateAction
                icon={<EnvelopeSimple size={20} />}
                title="Editar reglas de correo"
                onClick={onAddEmails}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
