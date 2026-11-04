import React from "react";
import { Modal } from "antd";
import { useTranslations } from "use-intl";
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
  const t = useTranslations("dataQuality.actionsModal");
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("title")}
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
              title={t("downloadMaterialsAux")}
              onClick={onDownloadCatalog}
              disabled={isDownloadCatalogLoading}
            />
            <ButtonGenerateAction
              icon={<UploadSimple size={20} />}
              title={t("uploadMaterialsAux")}
              onClick={onUploadMaterialsAuxiliary}
            />
          </>
        )}
        {activeTab === "puntos-de-venta" && (
          <>
            <ButtonGenerateAction
              icon={<DownloadSimple size={20} />}
              title={t("downloadPos")}
              onClick={onDownloadPointsOfSale}
              disabled={isDownloadPointsOfSaleLoading}
            />
            <ButtonGenerateAction
              icon={<UploadSimple size={20} />}
              title={t("uploadPos")}
              onClick={onUploadPointsOfSale}
            />
          </>
        )}
      </div>
    </Modal>
  );
};
