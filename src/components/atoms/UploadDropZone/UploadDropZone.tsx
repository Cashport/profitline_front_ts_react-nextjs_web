import React, { useCallback, useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";

import styles from "./uploadDropZone.module.scss";

interface UploadDropZoneProps {
  onFileUpload: (file: File) => void;
  allowedExtensions?: string[];
  title?: string;
  subtitle?: string;
  multiple?: boolean;
}

export const UploadDropZone: React.FC<UploadDropZoneProps> = ({
  onFileUpload,
  allowedExtensions,
  title = "Arrastra tu archivo aquí",
  subtitle = "O selecciona un archivo desde tu dispositivo",
  multiple = false
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
        if (multiple) {
          Array.from(files).forEach((file) => onFileUpload(file));
        } else {
          onFileUpload(files[0]);
        }
      }
    },
    [onFileUpload, multiple]
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        if (multiple) {
          Array.from(files).forEach((file) => onFileUpload(file));
        } else {
          onFileUpload(files[0]);
        }
        e.target.value = "";
      }
    },
    [onFileUpload, multiple]
  );

  return (
    <>
      <div
        className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.iconWrapper}>
          <Upload size={28} className="text-cashport-green" />
        </div>
        <p className={styles.title}>{title}</p>
        <p className={styles.subtitle}>{subtitle}</p>
        <button className={styles.selectButton} onClick={handleFileSelect} type="button">
          <FileText size={18} />
          Seleccionar Archivo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedExtensions?.join(",")}
        multiple={multiple}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />
    </>
  );
};
