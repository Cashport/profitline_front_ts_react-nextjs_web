import React from "react";
import { Modal } from "antd";
import { DownloadSimple, UploadSimple } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./catalogMaterialsActionsModal.scss";

export type CatalogTab = "materiales" | "packs" | "puntos-de-venta";

type CatalogMaterialsActionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activeTab: CatalogTab;
  onDownloadCatalog?: () => void;
  isDownloadCatalogLoading?: boolean;
  onDownloadPointsOfSale?: () => void;
  isDownloadPointsOfSaleLoading?: boolean;
  onUploadMaterialsAuxiliary?: () => void;
  onUploadPointsOfSale?: () => void;
};

export const CatalogMaterialsActionsModal: React.FC<CatalogMaterialsActionsModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onDownloadCatalog,
  isDownloadCatalogLoading,
  onDownloadPointsOfSale,
  isDownloadPointsOfSaleLoading,
  onUploadMaterialsAuxiliary,
  onUploadPointsOfSale
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
        {activeTab === "materiales" && (
          <>
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
          </>
        )}
        {activeTab === "puntos-de-venta" && (
          <>
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
            />
          </>
        )}
      </div>
    </Modal>
  );
};
