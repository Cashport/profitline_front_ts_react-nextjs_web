import React, { useCallback, useRef, useState } from "react";
import { Modal } from "antd";
import { Upload, FileText } from "lucide-react";

import ProfitLoader from "@/components/ui/profit-loader/profit-loader";

import styles from "./modalUploadFile.module.scss";

interface ModalUploadFileProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File) => void;
  loading?: boolean;
  title?: string;
  allowedExtensions?: string[];
}

export const ModalUploadFile: React.FC<ModalUploadFileProps> = ({
  isOpen,
  onClose,
  onFileUpload,
  loading = false,
  title = "Cargar archivo",
  allowedExtensions
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileUpload(files[0]);
      }
    },
    [onFileUpload]
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileUpload(files[0]);
        e.target.value = "";
      }
    },
    [onFileUpload]
  );

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={title}
      footer={null}
      centered
      closable={!loading}
      maskClosable={!loading}
    >
      <div className={styles.modalBody}>
        <div
          className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.iconWrapper}>
            <Upload size={28} color="#575a6b" />
          </div>
          <p className={styles.title}>Arrastra tu archivo aquí</p>
          <p className={styles.subtitle}>O selecciona un archivo desde tu dispositivo</p>
          <button className={styles.selectButton} onClick={handleFileSelect} type="button">
            <FileText size={18} />
            Seleccionar Archivo
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={allowedExtensions?.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {loading && (
          <div className={styles.loadingOverlay}>
            <ProfitLoader size="medium" />
          </div>
        )}
      </div>
    </Modal>
  );
};
