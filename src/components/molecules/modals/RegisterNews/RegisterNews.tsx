import React from "react";
import { Button, Flex, Modal, UploadFile } from "antd";
import { CaretLeft, Plus } from "@phosphor-icons/react";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import { UploadChangeParam } from "antd/es/upload";
import "./registerNews.scss";
import { IInvoice } from "@/types/invoices/IInvoices";
import { MessageInstance } from "antd/es/message/interface";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";
import { reportInvoiceIncident } from "@/services/accountingAdjustment/accountingAdjustment";

interface RegisterNewsProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  projectId?: number;
  invoiceSelected?: IInvoice[];
  messageShow: MessageInstance;
}

interface IFormRegisterNews {
  motive: string;
  commentary: string;
  evidence: File[];
}

const schema = yup.object().shape({
  motive: yup.string().required("El motivo es requerido"),
  commentary: yup.string().required("El comentario es requerido"),
  evidence: yup
    .array()
    .min(1, "Se requiere al menos un archivo de evidencia")
    .required("La evidencia es requerida")
});

const RegisterNews = ({
  isOpen,
  onClose,
  clientId,
  invoiceSelected,
  messageShow
}: RegisterNewsProps) => {
  const { data: motives, isLoading, isError } = useInvoiceIncidentMotives();

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

  const handleOnChangeDocument = (info: UploadChangeParam<UploadFile<any>>) => {
    const file = info.file.originFileObj;
    if (file) {
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

  const onSubmit = async (data: IFormRegisterNews) => {
    try {
      console.log("Datos del formulario:", data);
      await reportInvoiceIncident(
        invoiceSelected?.map((invoice) => invoice.id.toString()) || [],
        data.commentary,
        motives?.find((motive) => motive.name === data.motive)?.id.toString() || "",
        data.evidence,
        clientId?.toString() || ""
      );
      messageShow.success("Evidencia adjuntada con éxito");
      reset();
      onClose();
    } catch (error) {
      console.error("Error al registrar una novedad:", error);
      messageShow.error("Error al adjuntar la evidencia");
    }
  };

  return (
    <Modal className="contentRegisterNews" width="50%" footer={null} open={isOpen} closable={false}>
      <button className="contentRegisterNews__header" onClick={onClose}>
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
                  accept=".pdf,.png,.doc,.docx"
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
          <Button
            className="cancelButton"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancelar
          </Button>

          <Button
            className={`acceptButton ${isValid ? "acceptButton__green" : ""}`}
            htmlType="submit"
          >
            Adjuntar evidencia
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterNews;
