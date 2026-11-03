"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, message } from "antd";
import { CaretLeft } from "@phosphor-icons/react";
import { FileArrowUp } from "phosphor-react";
import type { Dayjs } from "dayjs";
import { useTranslations } from "use-intl";

import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import {
  createNewFileDate,
  getFileTypes,
  uploadGenericIntakeFile
} from "@/services/dataQuality/dataQuality";

import "../ModalCreateNewFile/modalCreateNewFile.scss";
import "./modalUploadInTransitHaleon.scss";

const IN_TRANSIT_HALEON_TYPE_DESCRIPTION = "In-Transit Haleon";

interface ModalUploadInTransitHaleonProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSuccess?: () => void;
}

interface IFormUploadInTransitHaleon {
  date: Dayjs | undefined;
}

interface IArchiveDraft {
  id: number;
  date: string;
}

const ModalUploadInTransitHaleon = ({
  isOpen,
  onClose,
  clientId,
  onSuccess
}: ModalUploadInTransitHaleonProps) => {
  const t = useTranslations("dataQuality.inTransitModal");
  const tCommon = useTranslations("common");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archiveDraft, setArchiveDraft] = useState<IArchiveDraft | null>(null);

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
    if (!file || !data.date) {
      message.error(t("required"));
      return;
    }

    setIsSubmitting(true);
    const hide = message.open({
      type: "loading",
      content: t("uploading"),
      duration: 0
    });

    try {
      const dateStr = data.date.format("YYYY-MM-DD");

      // Reutiliza el registro de fecha ya creado si el reintento es para la
      // misma fecha (evita duplicar archives_client_data).
      let idArchivesClientData =
        archiveDraft && archiveDraft.date === dateStr ? archiveDraft.id : null;

      if (!idArchivesClientData) {
        // Paso 1: resolver el ID del tipo global por descripción.
        const fileTypes = await getFileTypes();
        const inTransitType = fileTypes.find(
          (fileType) => fileType.description === IN_TRANSIT_HALEON_TYPE_DESCRIPTION
        );

        if (!inTransitType) {
          message.error(t("typeNotFound", { type: IN_TRANSIT_HALEON_TYPE_DESCRIPTION }));
          return;
        }

        // Paso 2: crear el registro de fecha para el cliente actual.
        const createdArchive = await createNewFileDate(Number(clientId), {
          date_archive: dateStr,
          id_type_archive: inTransitType.id,
          id_client_data_archives: Number(clientId)
        });

        idArchivesClientData = createdArchive?.id;
        if (!idArchivesClientData) {
          throw new Error(t("dateRecordError"));
        }

        setArchiveDraft({ id: idArchivesClientData, date: dateStr });
      }

      // Paso 3: subir el archivo por el flujo Universal (/transform/generic).
      await uploadGenericIntakeFile(idArchivesClientData, file);

      message.success(t("uploaded"));
      reset();
      setFile(null);
      setArchiveDraft(null);
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("uploadError"));
    } finally {
      hide();
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setFile(null);
    setArchiveDraft(null);
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
        <h4>{t("title")}</h4>
      </button>

      <form className="modalCreateNewFile__form">
        <InputDateForm
          titleInput={t("date")}
          nameInput="date"
          control={control}
          error={errors.date}
          placeholder={t("datePlaceholder")}
        />

        <div className="modalUploadInTransitHaleon__file">
          <p className="modalUploadInTransitHaleon__file-title">{t("file")}</p>
          <label className="modalUploadInTransitHaleon__file-dropzone">
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              disabled={isSubmitting}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
            <FileArrowUp size="1.5rem" />
            <span>{t("selectFile")}</span>
          </label>
          {file && (
            <p className="modalUploadInTransitHaleon__file-name">
              {t("selectedFile")} <strong>{file.name}</strong>
            </p>
          )}
        </div>
      </form>

      <FooterButtons
        handleOk={() => handleSubmit(handleUpload)()}
        onClose={handleClose}
        titleConfirm={tCommon("actions.upload")}
        titleCancel={tCommon("actions.cancel")}
        isConfirmLoading={isSubmitting}
        isConfirmDisabled={!isValid || !file}
      />
    </Modal>
  );
};

export default ModalUploadInTransitHaleon;
