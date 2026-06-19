import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, message } from "antd";
import { CaretLeft } from "@phosphor-icons/react";
import type { Dayjs } from "dayjs";

import { createNewFileDate, getFileTypes } from "@/services/dataQuality/dataQuality";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import "./modalCreateNewFile.scss";

interface ModalCreateNewFileProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string; // path id → id_client_data_archives
  clientNIT?: string | null; // clientDetail.id_client → clientNIT
  onSuccess?: () => void; // refresh the archives table
}

interface IFormCreateNewFile {
  fileTypeId: number | undefined;
  date: Dayjs | undefined;
}

const ModalCreateNewFile = ({
  isOpen,
  onClose,
  clientId,
  clientNIT,
  onSuccess
}: ModalCreateNewFileProps) => {
  const [fileTypeOptions, setFileTypeOptions] = useState<{ value: number; label: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<IFormCreateNewFile>({
    defaultValues: { fileTypeId: undefined, date: undefined }
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }
    if (fileTypeOptions.length > 0) return;
    const loadFileTypes = async () => {
      try {
        const fileTypes = await getFileTypes();
        setFileTypeOptions(
          fileTypes.map((fileType) => ({ value: fileType.id, label: fileType.description }))
        );
      } catch {
        message.error("Error al cargar los tipos de archivo");
      }
    };
    loadFileTypes();
  }, [isOpen, reset, fileTypeOptions.length]);

  const handleCreateFile = async (data: IFormCreateNewFile) => {
    setIsSubmitting(true);
    try {
      await createNewFileDate(Number(clientNIT), {
        id_type_archive: data.fileTypeId!,
        date_archive: data.date!.format("YYYY-MM-DD"),
        id_client_data_archives: Number(clientId)
      });
      message.success("Archivo creado exitosamente");
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al crear el archivo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal className="modalCreateNewFile" width={460} footer={null} open={isOpen} closable={false}>
      <button className="modalCreateNewFile__header" onClick={handleClose}>
        <CaretLeft size="1.25rem" />
        <h4>Crear nuevo archivo</h4>
      </button>

      <form className="modalCreateNewFile__form">
        <InputSelect
          titleInput="Tipo de archivo"
          nameInput="fileTypeId"
          control={control}
          error={errors.fileTypeId as any}
          options={fileTypeOptions}
          placeholder="Seleccionar tipo de archivo"
        />
        <InputDateForm
          titleInput="Fecha"
          nameInput="date"
          control={control}
          error={errors.date}
          placeholder="Seleccionar fecha"
        />
      </form>

      <FooterButtons
        handleOk={() => handleSubmit(handleCreateFile)()}
        onClose={handleClose}
        titleConfirm="Crear archivo"
        isConfirmLoading={isSubmitting}
        isConfirmDisabled={!isValid}
      />
    </Modal>
  );
};

export default ModalCreateNewFile;
