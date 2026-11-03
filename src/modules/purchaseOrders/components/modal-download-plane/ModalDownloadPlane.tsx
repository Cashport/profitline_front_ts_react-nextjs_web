import React, { useEffect, useState } from "react";
import { Modal, Checkbox, message, Spin } from "antd";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import {
  getDownloadableFiles,
  downloadAvailableDocuments
} from "@/services/purchaseOrders/purchaseOrders";
import { IAvailableDocument } from "@/types/purchaseOrders/purchaseOrders";

import "./modalDownloadPlane.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  packageIds: string[];
};

export const ModalDownloadPlane: React.FC<Props> = ({ isOpen, onClose, packageIds }) => {
  const t = useTranslations("purchaseOrders.downloadPlane");
  const tCommon = useTranslations("common");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [files, setFiles] = useState<IAvailableDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const data = await getDownloadableFiles(packageIds);
        setFiles(data.documents);
      } catch (error) {
        message.error(t("fetchError"));
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [isOpen, packageIds, t]);

  const total = files.length;
  const selectedCount = selectedTypes.length;
  const allSelected = total > 0 && selectedCount === total;
  const someSelected = selectedCount > 0 && !allSelected;

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(files.map((f) => f.type));
    }
  };

  const handleToggleOne = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type]
    );
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadAvailableDocuments({
        packageIds: packageIds.map((id) => Number(id)),
        documents: selectedTypes
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "documentos.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success(t("success"));
      handleClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("downloadError"));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    setSelectedTypes([]);
    setFiles([]);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={t("title")}
      footer={null}
      centered
      destroyOnClose
      className="modalDownloadPlane"
      width={520}
    >
      <p className="modalDownloadPlane__subtitle">{t("subtitle")}</p>

      {isLoading ? (
        <div className="modalDownloadPlane__loading">
          <Spin />
        </div>
      ) : (
        <>
          <div className="modalDownloadPlane__selectAllRow">
            <Checkbox checked={allSelected} indeterminate={someSelected} onChange={handleToggleAll}>
              {t("selectAll")}
            </Checkbox>
            <span className="modalDownloadPlane__counter">
              {t("selectedCount", { selected: selectedCount, total })}
            </span>
          </div>

          <div className="modalDownloadPlane__list">
            {files.map((file) => (
              <div className="modalDownloadPlane__row" key={`${file.label}-${file.type}`}>
                <Checkbox
                  checked={selectedTypes.includes(file.type)}
                  onChange={() => handleToggleOne(file.type)}
                >
                  <div className="modalDownloadPlane__fileInfo">
                    <span className="modalDownloadPlane__fileName">{file.label}</span>
                    <span className="modalDownloadPlane__formatType">{file.label}</span>
                  </div>
                </Checkbox>
                <span className="modalDownloadPlane__fileType">{file.type.split("_").pop()}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <FooterButtons
        titleConfirm={tCommon("actions.download")}
        titleCancel={tCommon("actions.cancel")}
        isConfirmDisabled={selectedCount === 0 || isDownloading}
        isConfirmLoading={isDownloading}
        onClose={handleClose}
        handleOk={handleDownload}
      />
    </Modal>
  );
};
