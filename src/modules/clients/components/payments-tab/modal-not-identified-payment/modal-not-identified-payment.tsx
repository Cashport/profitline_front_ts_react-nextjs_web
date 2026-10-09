import { Dispatch, FC, SetStateAction, useState } from "react";
import { Flex } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CaretLeft } from "phosphor-react";

import { useMessageApi } from "@/context/MessageContext";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";

import { IFormIdentifyPaymentModal } from "@/types/clientPayments/IClientPayments";

import styles from "./modal-not-identified-payment.module.scss";

interface ModalNotIdentifiedPaymentProps {
  // eslint-disable-next-line no-unused-vars
  setViewInfo: Dispatch<
    SetStateAction<{
      current: "form" | "identified" | "not_identified";
      paymentInfo: IFormIdentifyPaymentModal | undefined;
    }>
  >;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
}

interface infoObject {
  file: File;
  fileList: File[];
}

interface IFormNotIdentifiedPaymentModal {
  evidence?: File;
  comment: string;
}

const ModalNotIdentifiedPayment: FC<ModalNotIdentifiedPaymentProps> = ({
  setViewInfo
}) => {
  const { showMessage } = useMessageApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
    trigger
  } = useForm<IFormNotIdentifiedPaymentModal>({});

  const evidence = watch("evidence");

  const handleOnDeleteDocument = () => {
    setValue("evidence", undefined); // Remove the file from "evidence"
    trigger("evidence"); // Trigger validation for "evidence"
  };

  const handleOnChangeDocument: any = (info: infoObject) => {
    const { file: rawFile } = info;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        showMessage(
          "error",
          "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
        );
        return;
      }
      setValue("evidence", rawFile);
      trigger("evidence");
    }
  };

  const onSubmit = (data: IFormNotIdentifiedPaymentModal) => {
    setIsSubmitting(true);

    try {
      console.info("Form data:", data);
      showMessage("success", "Notificación enviada correctamente");
      // onClose()
    } catch (error) {
      showMessage("error", "Error al enviar notificación");
    }
    //timer 2 seconds
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  };

  const handleCancel = () => {
    setViewInfo((prev) => ({ ...prev, current: "form" }));
  };

  return (
    <div className={styles.content}>
      <button className={styles.content__header} onClick={handleCancel}>
        <CaretLeft size={"1.25rem"} />
        <h4>Pago no encontrado</h4>
      </button>
      <p className={styles.content__description}>
        El pago no fue encontrado. Si deseas revisar la información, por favor regresa a la página
        anterior. De lo contrario, envía una notificación.
      </p>
      <div className={styles.content__evidence}>
        <Flex vertical>
          <p>Evidencia</p>
          <em className="descriptionDocument">*Obligatorio</em>
        </Flex>
        <Controller
          name="evidence"
          control={control}
          rules={{ required: "Evidencia es obligatoria" }}
          render={() => (
            <DocumentButton
              title={evidence?.name}
              handleOnChange={handleOnChangeDocument}
              handleOnDelete={handleOnDeleteDocument}
              fileName={evidence?.name}
              fileSize={evidence?.size}
            />
          )}
        />
        <Flex vertical>
          <p>Comentarios</p>
          <em className="descriptionDocument">*Opcional</em>
        </Flex>
        <Controller
          name="comment"
          control={control}
          rules={{ required: false }}
          render={({ field }) => <textarea {...field} placeholder="Ingresar un comentario" />}
        />
      </div>
      <div className={styles.footer}>
        <SecondaryButton onClick={handleCancel}>Cancelar</SecondaryButton>
        <PrincipalButton
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar notificación"}
        </PrincipalButton>
      </div>
    </div>
  );
};

export default ModalNotIdentifiedPayment;
