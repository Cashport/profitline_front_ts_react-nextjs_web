import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Flex, Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { CaretLeft, Plus } from "@phosphor-icons/react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { useAppStore } from "@/lib/store/store";
import { reportInvoiceIncident } from "@/services/accountingAdjustment/accountingAdjustment";

import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";
import { InputFormMoney } from "@/components/atoms/inputs/InputFormMoney/InputFormMoney";

import { IInvoice } from "@/types/invoices/IInvoices";

import "./registerNews.scss";
interface RegisterNewsProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  projectId?: number;
  invoiceSelected?: IInvoice[];
  messageShow: MessageInstance;
  onCloseAllModals: () => void;
}
interface infoObject {
  file: File;
  fileList: File[];
}

interface IFormRegisterNews {
  motive: string;
  commentary: string;
  evidence: File[];
  amount?: string;
}

const schema = yup.object().shape({
  motive: yup.string().required("El motivo es requerido"),
  commentary: yup.string().required("El comentario es requerido"),
  evidence: yup
    .array()
    .min(1, "Se requiere al menos un archivo de evidencia")
    .required("La evidencia es requerida"),
  amount: yup.string().optional()
});

const RegisterNews = ({
  isOpen,
  onClose,
  clientId,
  invoiceSelected,
  messageShow,
  onCloseAllModals
}: RegisterNewsProps) => {
  const { data: motives, isLoading, isError } = useInvoiceIncidentMotives();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
    trigger
  } = useForm<IFormRegisterNews>({
    resolver: yupResolver(schema),
    defaultValues: {
      motive: "",
      commentary: "",
      evidence: []
    }
  });

  const evidence = watch("evidence");

  const handleOnChangeDocument: any = (info: infoObject) => {
    const { file: rawFile } = info;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        messageShow.error(
          "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
        );
        return;
      }
      setValue("evidence", [...evidence, rawFile]);
      trigger("evidence");
    }
  };

  const handleOnDeleteDocument = (fileName: string) => {
    const updatedFiles = evidence.filter((file) => file.name !== fileName);
    setValue("evidence", updatedFiles);
    trigger("evidence");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        messageShow.error(
          "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
        );
        return;
      }
      setValue("evidence", [...evidence, file]);
      trigger("evidence");
    }
  };
  const handleOnDrop: any = (e: any) => {
    const rawFile = e.dataTransfer.files;

    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);

      if (fileSizeInMB > 30) {
        alert("El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB.");
        return;
      }
      setValue("evidence", [...evidence, rawFile]);
      trigger("evidence");
    }
  };

  const onSubmit = async (data: IFormRegisterNews) => {
    setIsSubmitting(true);

    try {
      await reportInvoiceIncident(
        invoiceSelected?.map((invoice) => invoice.id) || [],
        data.commentary,
        motives?.find((motive) => motive.name === data.motive)?.id.toString() || "",
        data.evidence,
        clientId?.toString() || "",
        projectId.toString(),
        data.amount ? data.amount : undefined
      );
      messageShow.success("Evidencia adjuntada con éxito");
      reset();
      onCloseAllModals();
    } catch (error) {
      console.error("Error al registrar una novedad:", error);
      messageShow.error("Error al adjuntar la evidencia");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleClose = () => {
    reset();
    onClose();
  };
  return (
    <Modal className="contentRegisterNews" width="50%" footer={null} open={isOpen} closable={false}>
      <button className="contentRegisterNews__header" onClick={handleClose}>
        <CaretLeft size="1.25rem" />
        <h4>Registrar novedad</h4>
      </button>
      <p className="contentRegisterNews__description">
        Adjunta la evidencia e ingresa un comentario
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="contentRegisterNews__form">
        <div className="contentRegisterNews__select">
          <InputSelect
            titleInput="Motivo"
            nameInput="motive"
            control={control}
            error={errors.motive}
            options={motives?.map((motive) => ({ value: motive?.name, label: motive?.name })) || []}
            loading={isLoading}
            isError={isError}
            placeholder="Seleccionar motivo"
          />
          <InputFormMoney
            titleInput="Monto novedad"
            nameInput="amount"
            control={control}
            error={errors.amount}
            placeholder="Ingresar monto"
            typeInput="number"
            customStyle={{ width: "100%" }}
          />
          <div />
        </div>
        <div className="contentRegisterNews__evidence">
          <Flex vertical>
            <p>Evidencia</p>
            <em className="descriptionDocument">*Obligatorio</em>
          </Flex>
          <Flex vertical gap="0.7rem">
            <DocumentButton
              key={evidence[0]?.name}
              title={evidence[0]?.name}
              handleOnChange={handleOnChangeDocument}
              handleOnDrop={handleOnDrop}
              handleOnDelete={() => handleOnDeleteDocument(evidence[0]?.name)}
              fileName={evidence[0]?.name}
              fileSize={evidence[0]?.size}
            />
            {evidence.slice(1).map((file, index) => (
              <DocumentButton
                key={file.name}
                className={index > 0 ? "documentButton" : ""}
                title={file.name}
                handleOnChange={handleOnChangeDocument}
                handleOnDelete={() => handleOnDeleteDocument(file.name)}
                fileName={file.name}
                fileSize={file.size}
              />
            ))}
            {evidence.length > 0 && (
              <>
                <Button
                  onClick={() => {
                    const fileInput = document.getElementById("fileInput");
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                  className="addDocument"
                  icon={<Plus size={"1rem"} />}
                >
                  <p>Cargar otro documento</p>
                </Button>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".pdf, .png, .doc, .docx, .xls, .xlsx, .msg, .txt, .eml"
                />
              </>
            )}
            {errors.evidence && <p className="error">{errors.evidence.message}</p>}
          </Flex>
          <p>Comentarios</p>
          <div>
            <Controller
              name="commentary"
              control={control}
              render={({ field }) => <textarea {...field} placeholder="Ingresar un comentario" />}
            />
            {errors.commentary && <p className="error">{errors.commentary.message}</p>}
          </div>
        </div>
        <div className="footer">
          <Button className="cancelButton" onClick={handleClose}>
            Cancelar
          </Button>

          <Button
            className={`acceptButton ${isValid ? "acceptButton__green" : ""}`}
            htmlType="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Adjuntar evidencia"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterNews;
