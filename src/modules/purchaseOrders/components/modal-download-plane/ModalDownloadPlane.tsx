import React, { useEffect, useState } from "react";
import { Modal, Checkbox, message, Spin } from "antd";

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
  packageId: string;
};

export const ModalDownloadPlane: React.FC<Props> = ({ isOpen, onClose, packageId }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [files, setFiles] = useState<IAvailableDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const data = await getDownloadableFiles(packageId);
        setFiles(data.documents);
      } catch (error) {
        message.error("Error al obtener los archivos disponibles");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [isOpen, packageId]);

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
        packageId: Number(packageId),
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
      message.success("Archivos descargados exitosamente");
      handleClose();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al descargar los archivos"
      );
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
      title="Descargar plano"
      footer={null}
      centered
      destroyOnClose
      className="modalDownloadPlane"
      width={520}
    >
      <p className="modalDownloadPlane__subtitle">Selecciona los archivos que deseas descargar:</p>

      {isLoading ? (
        <div className="modalDownloadPlane__loading">
          <Spin />
        </div>
      ) : (
        <>
          <div className="modalDownloadPlane__selectAllRow">
            <Checkbox checked={allSelected} indeterminate={someSelected} onChange={handleToggleAll}>
              Seleccionar todos
            </Checkbox>
            <span className="modalDownloadPlane__counter">
              {selectedCount} de {total} seleccionados
            </span>
          </div>

          <div className="modalDownloadPlane__list">
            {files.map((file) => (
              <div className="modalDownloadPlane__row" key={file.id}>
                <Checkbox
                  checked={selectedTypes.includes(file.type)}
                  onChange={() => handleToggleOne(file.type)}
                >
                  <div className="modalDownloadPlane__fileInfo">
                    <span className="modalDownloadPlane__fileName">{file.label}</span>
                    <span className="modalDownloadPlane__formatType">{file.type}</span>
                  </div>
                </Checkbox>
                <span className="modalDownloadPlane__fileType">{file.type.split("_").pop()}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <FooterButtons
        titleConfirm="Descargar"
        titleCancel="Cancelar"
        isConfirmDisabled={selectedCount === 0 || isDownloading}
        isConfirmLoading={isDownloading}
        onClose={handleClose}
        handleOk={handleDownload}
      />
    </Modal>
  );
};
