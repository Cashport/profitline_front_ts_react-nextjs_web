import React from "react";
import { Modal } from "antd";
import { useTranslations } from "use-intl";
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
  const t = useTranslations("dataQuality.actionsModal");
  const gmnOficialesButton = onUploadGmnOficiales ? (
    <ButtonGenerateAction
      icon={<UploadSimple size={20} />}
      title={t("uploadProductMaster")}
      onClick={onUploadGmnOficiales}
    />
  ) : null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={onlyGmnOficiales ? t("uploadProductMaster") : t("title")}
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
              title={t("downloadCatalog")}
              onClick={onDownloadCatalog}
              disabled={isDownloadCatalogLoading}
            />
            {onDownloadIqviaCatalog && (
              <ButtonGenerateAction
                icon={<DownloadSimple size={20} />}
                title={t("downloadIqviaCustomers")}
                onClick={onDownloadIqviaCatalog}
                disabled={isDownloadIqviaCatalogLoading}
              />
            )}
            {onDownloadIqviaProductCatalog && (
              <ButtonGenerateAction
                icon={<DownloadSimple size={20} />}
                title={t("downloadIqviaProducts")}
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
                title={t("uploadIqviaCustomers")}
                onClick={onUploadIqviaCatalog}
              />
            )}
            {onUploadIqviaProductCatalog && (
              <ButtonGenerateAction
                icon={<UploadSimple size={20} />}
                title={t("uploadIqviaProducts")}
                onClick={onUploadIqviaProductCatalog}
              />
            )}
            {onDownloadMaterials && (
              <ButtonGenerateAction
                icon={<DownloadSimple size={20} />}
                title={t("downloadMaterialsAux")}
                onClick={onDownloadMaterials}
              />
            )}
            <ButtonGenerateAction
              icon={<UploadSimple size={20} />}
              title={t("uploadMaterialsAux")}
              onClick={onUploadMaterialsAuxiliary}
            />
            {isInDetailView && (
              <ButtonGenerateAction
                icon={<UploadSimple size={20} />}
                title={t("uploadHistory")}
                onClick={onUploadFile}
              />
            )}
            {onDownloadPointsOfSale && (
              <ButtonGenerateAction
                icon={<DownloadSimple size={20} />}
                title={t("downloadPos")}
                onClick={onDownloadPointsOfSale}
              />
            )}
            <ButtonGenerateAction
              icon={<UploadSimple size={20} />}
              title={t("uploadPos")}
              onClick={onUploadPointsOfSale}
            />
            <ButtonGenerateAction
              icon={<UploadSimple size={20} />}
              title={t("uploadPacks")}
              onClick={onUploadPacks}
            />
            {gmnOficialesButton}
            {isInDetailView && (
              <ButtonGenerateAction
                icon={<UploadSimple size={20} />}
                title={t("uploadInTransitHaleon")}
                onClick={onUploadInTransitHaleon}
              />
            )}
            {onAddEmails && (
              <ButtonGenerateAction
                icon={<EnvelopeSimple size={20} />}
                title={t("editEmailRules")}
                onClick={onAddEmails}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
