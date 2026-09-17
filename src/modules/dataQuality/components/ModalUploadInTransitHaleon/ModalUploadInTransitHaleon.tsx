"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, message } from "antd";
import { CaretLeft } from "@phosphor-icons/react";
import { FileArrowUp } from "phosphor-react";
import type { Dayjs } from "dayjs";

import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import "../ModalCreateNewFile/modalCreateNewFile.scss";
import "./modalUploadInTransitHaleon.scss";

interface ModalUploadInTransitHaleonProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface IFormUploadInTransitHaleon {
  date: Dayjs | undefined;
}

const ModalUploadInTransitHaleon = ({
  isOpen,
  onClose,
  onSuccess
}: ModalUploadInTransitHaleonProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<IFormUploadInTransitHaleon>({
    mode: "onChange",
    defaultValues: { date: undefined }
  });

  const handleUpload = async (data: IFormUploadInTransitHaleon) => {
    if (!file) {
      message.error("El archivo In Transit Haleon es obligatorio *");
      return;
    }
    setIsSubmitting(true);
    try {
      // MOCK: no llamar al Backend por ahora.
      // El tipo de archivo queda implícito como "In Transit Haleon".
      await new Promise((resolve) => setTimeout(resolve, 800));
      message.success("Archivo cargado correctamente (MOCK)");
      reset();
      setFile(null);
      onSuccess?.();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setFile(null);
    onClose();
  };

  return (
    <Modal
      className="modalCreateNewFile"
      width={460}
      footer={null}
      open={isOpen}
      closable={false}
      maskClosable={!isSubmitting}
    >
      <button className="modalCreateNewFile__header" onClick={handleClose} type="button">
        <CaretLeft size="1.25rem" />
        <h4>Cargar &quot;In Transit Haleon&quot;</h4>
      </button>

      <form className="modalCreateNewFile__form">
        <InputDateForm
          titleInput="Fecha"
          nameInput="date"
          control={control}
          error={errors.date}
          placeholder="Seleccionar fecha"
        />

        <div className="modalUploadInTransitHaleon__file">
          <p className="modalUploadInTransitHaleon__file-title">Archivo</p>
          <label className="modalUploadInTransitHaleon__file-dropzone">
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              disabled={isSubmitting}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
            <FileArrowUp size="1.5rem" />
            <span>Seleccionar archivo</span>
          </label>
          {file && (
            <p className="modalUploadInTransitHaleon__file-name">
              Archivo seleccionado: <strong>{file.name}</strong>
            </p>
          )}
        </div>
      </form>

      <FooterButtons
        handleOk={() => handleSubmit(handleUpload)()}
        onClose={handleClose}
        titleConfirm="Cargar"
        titleCancel="Cancelar"
        isConfirmLoading={isSubmitting}
        isConfirmDisabled={!isValid || !file}
      />
    </Modal>
  );
};

export default ModalUploadInTransitHaleon;
