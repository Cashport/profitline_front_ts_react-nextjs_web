import React, { useState } from "react";
import { Modal, Checkbox } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import "./modalDownloadPlane.scss";

type FileItem = {
  id: string;
  name: string;
  fileType: string;
  formatType: string;
};

const MOCK_FILES: FileItem[] = [
  {
    id: "1",
    name: "OC_20250831334N.pdf",
    fileType: "PDF",
    formatType: "Orden de compra"
  },
  {
    id: "2",
    name: "Formato_facturacion_20250831334N.xlsx",
    fileType: "Excel",
    formatType: "Formato facturación"
  },
  {
    id: "3",
    name: "Productos_20250831334N.xlsx",
    fileType: "Excel",
    formatType: "Listado de productos"
  }
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ModalDownloadPlane: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const total = MOCK_FILES.length;
  const selectedCount = selectedIds.length;
  const allSelected = selectedCount === total;
  const someSelected = selectedCount > 0 && !allSelected;

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(MOCK_FILES.map((f) => f.id));
    }
  };

  const handleToggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDownload = () => {
    const selectedFiles = MOCK_FILES.filter((f) => selectedIds.includes(f.id));
    // eslint-disable-next-line no-console
    console.log(selectedFiles);
    onClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
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
      <p className="modalDownloadPlane__subtitle">
        Selecciona los archivos que deseas descargar:
      </p>

      <div className="modalDownloadPlane__selectAllRow">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={handleToggleAll}
        >
          Seleccionar todos
        </Checkbox>
        <span className="modalDownloadPlane__counter">
          {selectedCount} de {total} seleccionados
        </span>
      </div>

      <div className="modalDownloadPlane__list">
        {MOCK_FILES.map((file) => (
          <div className="modalDownloadPlane__row" key={file.id}>
            <Checkbox
              checked={selectedIds.includes(file.id)}
              onChange={() => handleToggleOne(file.id)}
            >
              <div className="modalDownloadPlane__fileInfo">
                <span className="modalDownloadPlane__fileName">{file.name}</span>
                <span className="modalDownloadPlane__formatType">{file.formatType}</span>
              </div>
            </Checkbox>
            <span className="modalDownloadPlane__fileType">{file.fileType}</span>
          </div>
        ))}
      </div>

      <FooterButtons
        titleConfirm="Descargar"
        titleCancel="Cancelar"
        isConfirmDisabled={selectedCount === 0}
        onClose={handleClose}
        handleOk={handleDownload}
      />
    </Modal>
  );
};
