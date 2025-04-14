import React from "react";
import { Button, Flex, Modal } from "antd";
import { CaretLeft, Plus } from "@phosphor-icons/react";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import "./registerNewsConcilation.scss";
import { MessageInstance } from "antd/es/message/interface";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { invoiceCreateIncident } from "@/services/concilation/concilation";
import { useRouter } from "next/navigation";
import { InfoConcilation } from "@/types/concilation/concilation";
import { useAppStore } from "@/lib/store/store";
import { useModalDetail } from "@/context/ModalContext";

interface RegisterNewsProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  projectId?: number;
  invoices: InfoConcilation | undefined;
  messageShow: MessageInstance;
}
interface infoObject {
  file: File;
  fileList: File[];
}

interface IFormRegisterNews {
  commentary: string;
  evidence: File[];
}

const schema = yup.object().shape({
  commentary: yup.string().required("El comentario es requerido"),
  evidence: yup
    .array()
    .min(1, "Se requiere al menos un archivo de evidencia")
    .required("La evidencia es requerida")
});

const RegisterNewsConcilation = ({
  isOpen,
  onClose,
  clientId,
  invoices,
  messageShow
}: RegisterNewsProps) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { openModal } = useModalDetail();

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
      commentary: "",
      evidence: []
    }
  });
  const router = useRouter();
  const { ID } = useAppStore((state) => state.selectedProject);

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
      if (!invoices) return;
      const invoiceList = Object.entries(invoices).flatMap(([key, category]) =>
        category.invoices.map(
          (invoice: {
            id: string;
            motive_id: string;
            difference_amount: string;
            observation?: string;
          }) => ({
            invoice_id: invoice.id,
            motive_id: invoice.motive_id,
            difference: invoice.difference_amount,
            status: key,
            observation: invoice.observation
          })
        )
      );
      try {
        const response = await invoiceCreateIncident(
          data.evidence,
          invoiceList,
          data.commentary,
          clientId || ""
        );
        if (response.status == 200) {
          onClose();
          openModal("sendEmail", {
            event_id: "massConciliation",
            onFinalOk: () => {
              router.push(`/clientes/detail/${clientId}/project/${ID}`);
            },
            customOnReject: () => {
              router.push(`/clientes/detail/${clientId}/project/${ID}`);
            }
          });
        }
      } catch (error) {}
    } catch (error) {
      console.error("Error al registrar una novedad:", error);
      messageShow.error("Error al adjuntar la evidencia");
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      className="contentRegisterNewsConcilation"
      width="50%"
      footer={null}
      open={isOpen}
      closable={false}
    >
      <button className="contentRegisterNewsConcilation__header" onClick={handleClose}>
        <CaretLeft size="1.25rem" />
        <h4>Finalizar conciliación</h4>
      </button>
      <p className="contentRegisterNewsConcilation__description">
        Adjunta la evidencia e ingresa un comentario
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="contentRegisterNewsConcilation__form">
        <div className="contentRegisterNewsConcilation__evidence">
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
            disabled={!isValid || isSubmitting}
            htmlType="submit"
          >
            Finalizar conciliación
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterNewsConcilation;
