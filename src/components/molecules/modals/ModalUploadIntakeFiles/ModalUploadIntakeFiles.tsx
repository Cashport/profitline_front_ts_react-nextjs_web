import { useState } from "react";
import { message, Modal, Typography } from "antd";
import type { UploadFile } from "antd";
import { UploadChangeParam } from "antd/es/upload";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import { uploadIntakeFile } from "@/services/dataQuality/dataQuality";

import "./modalUploadIntakeFiles.scss";

const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  archiveId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ModalUploadIntakeFiles = ({ isOpen, archiveId, onClose, onSuccess }: Props) => {
  const [ingestaFile, setIngestaFile] = useState<File | undefined>();
  const [pruebaFile, setPruebaFile] = useState<File | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setIngestaFile(undefined);
    setPruebaFile(undefined);
  };

  const handleClose = () => {
    if (isLoading) return;
    resetState();
    onClose();
  };

  const extractFile = (info: UploadChangeParam<UploadFile<any>>): File | undefined => {
    const raw = info.file as unknown as File & { originFileObj?: File };
    return raw?.originFileObj ?? raw;
  };

  const handleChange =
    (setter: (file: File | undefined) => void) => (info: UploadChangeParam<UploadFile<any>>) => {
      const file = extractFile(info);
      if (!file) return;
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        message.error(
          "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
        );
        return;
      }
      setter(file);
    };

  const handleDelete =
    (setter: (file: File | undefined) => void) => (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setter(undefined);
    };

  const handleSubmit = async () => {
    if (!ingestaFile || archiveId === null) return;
    setIsLoading(true);
    const hide = message.open({
      type: "loading",
      content: "Subiendo archivo de ingesta...",
      duration: 0
    });
    try {
      await uploadIntakeFile(archiveId, ingestaFile, pruebaFile);
      message.success("Archivo de ingesta subido exitosamente.");
      onSuccess?.();
      resetState();
      onClose();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Error al subir el archivo de ingesta. Por favor, inténtalo de nuevo."
      );
    } finally {
      hide();
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={<Title level={4}>Subir archivos</Title>}
      className="modalUploadIntakeFiles"
      width={600}
      footer={
        <FooterButtons
          titleConfirm="Enviar"
          titleCancel="Cancelar"
          onClose={handleClose}
          handleOk={handleSubmit}
          isConfirmDisabled={!ingestaFile}
          isConfirmLoading={isLoading}
        />
      }
      destroyOnClose
    >
      <div className="fileRow">
        <Text className="label">Ingesta</Text>
        <div className="documentButtonWrapper">
          <DocumentButton
            title="Ingesta"
            fileName={ingestaFile?.name}
            fileSize={ingestaFile?.size}
            handleOnChange={handleChange(setIngestaFile)}
            handleOnDelete={handleDelete(setIngestaFile)}
          />
        </div>
      </div>
      <div className="fileRow">
        <div className="label">
          <Text>Prueba</Text>
          <em className="opt">*Opcional</em>
        </div>
        <div className="documentButtonWrapper">
          <DocumentButton
            title="Prueba"
            fileName={pruebaFile?.name}
            fileSize={pruebaFile?.size}
            handleOnChange={handleChange(setPruebaFile)}
            handleOnDelete={handleDelete(setPruebaFile)}
          />
        </div>
      </div>
    </Modal>
  );
};
