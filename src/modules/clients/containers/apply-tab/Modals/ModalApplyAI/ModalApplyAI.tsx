"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Flex, message, Modal, Spin, UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { File, Sparkle, Trash, Upload, X } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { extractSingleParam } from "@/utils/utils";
import {
  applyWithCashportAI,
  uploadPaymentAttachment
} from "@/services/applyTabClients/applyTabClients";

import { FILE_EXTENSIONS } from "@/utils/constants/globalConstants";

import "./modalApplyAI.scss";

export interface IUploadRequirementstTableRow {
  fileName: string;
  file?: File;
  requirementType?: number;
  requirementTypeName?: string;
  state?: string;
  expirationDate?: string;
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  mutate: () => void;
}

const ModalApplyAI = ({ isOpen, onClose, mutate }: Props) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string>();
  const [loading, setLoading] = useState(false);

  const closeModal = () => {
    onClose();
    setUploadedFiles([]);
  };

  const handleOnChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentary(e.target.value);
  };

  const handleAnalyzeFiles = async () => {
    setLoading(true);
    try {
      await uploadPaymentAttachment(projectId, clientId, uploadedFiles, commentary);
      await applyWithCashportAI(projectId, clientId, uploadedFiles, commentary);
      message.success("Archivos analizados con CashportAI");
    } catch (error) {
      message.error("Error al aplicar con CashportAI");
    }
    closeModal();
    mutate();
    setLoading(false);
  };

  const props: UploadProps = {
    className: "modalApplyAI__dragger",
    name: "file",
    multiple: true,
    // before upload to check is under 5MB
    beforeUpload: (file) => {
      const isUnder5MB = file.size / 1024 / 1024 < 5;
      if (!isUnder5MB) {
        message.error("El archivo debe ser menor a 5MB");
        return false;
      }
      return isUnder5MB;
    },
    customRequest({ onSuccess }) {
      setTimeout(() => {
        // Simulamos un upload exitoso
        onSuccess && onSuccess("ok");
      }, 100); // puede ser 0 si quieres que sea inmediato
    },
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        if (info.file.originFileObj) {
          const newFile = info.file.originFileObj as File;
          setUploadedFiles((prev) => [...prev, newFile]);
        }
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    itemRender: (_, file, _fileList, functions) => {
      const { remove } = functions;
      const { name, status, size } = file;

      return (
        <Flex className="draggerFileCard" align="center" justify="space-between">
          <Flex className="fileInfo" vertical align="flex-start">
            <File className="fileIcon" size={20} />
            <p>{name}</p>
            <p>
              {(() => {
                const fileSize = size ?? 0;
                const fileSizeMB = fileSize / (1024 * 1024);
                if (fileSizeMB < 1) {
                  return `${(fileSize / 1024).toFixed(2)} KB`;
                } else {
                  return `${fileSizeMB.toFixed(2)} MB`;
                }
              })()}
            </p>
          </Flex>
          {status === "done" && (
            <Button className="fileIcon" onClick={remove}>
              <Trash size={14} />
            </Button>
          )}
          {status === "uploading" && <Spin size="small" />}
          {!status && (
            <Button className="fileIcon -error" onClick={remove}>
              <X size={14} />
            </Button>
          )}
        </Flex>
      );
    },
    onRemove: (file) => {
      const updatedFiles = uploadedFiles.filter((uploadedFile) => uploadedFile.name !== file.name);
      setUploadedFiles(updatedFiles);
    },
    accept: FILE_EXTENSIONS.join(",")
  };

  return (
    <Modal
      className="modalApplyAI"
      width={686}
      footer={null}
      open={isOpen}
      onCancel={closeModal}
      destroyOnClose
    >
      <span className="modalApplyAI__title">
        Aplicar pagos con
        <span>
          <span
            className="cashportIATextGradient"
            style={{
              fontWeight: 600
            }}
          >
            {" "}
            CashportAI
          </span>
        </span>
      </span>
      <span className="modalApplyAI__description">
        Sube los documentos y
        <span>
          <span className="cashportIATextGradient"> CashportAI </span>
        </span>
        los analizará y clasificará según su tipo.
      </span>
      <Dragger {...props}>
        <Upload size={30} className="draggerIcon" />
        <p className="draggerText">Arrastra y suelta tu archivo aquí o haz clic para subirlo</p>
        <p className="draggerText -small">Tamaño máximo 5MB</p>
      </Dragger>

      <div className="modalApplyAI__commentary">
        <p>Comentario</p>
        <textarea onChange={handleOnChangeTextArea} placeholder="Ingresar un comentario" />
      </div>

      <div className="modalApplyAI__footer">
        <Button className="cancelButton" onClick={() => onClose(true)}>
          Cancelar
        </Button>
        <Button
          className="iaButton"
          disabled={uploadedFiles.length === 0}
          onClick={handleAnalyzeFiles}
          loading={loading}
        >
          <Sparkle size={14} color="#5b21b6" weight="fill" />
          <span className="textNormal">
            Analizar con{" "}
            <span
              className="cashportIATextGradient"
              style={{
                fontWeight: 500
              }}
            >
              CashportAI
            </span>
          </span>
        </Button>
      </div>
    </Modal>
  );
};

export default ModalApplyAI;
