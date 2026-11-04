import { Dispatch, FC, SetStateAction, useState } from "react";
import { Flex } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CaretLeft } from "phosphor-react";
import { useTranslations } from "use-intl";

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

const ModalNotIdentifiedPayment: FC<ModalNotIdentifiedPaymentProps> = ({ setViewInfo }) => {
  const t = useTranslations("clients.payments.notIdentifiedPayment");
  const tAttachment = useTranslations("clients.payments.attachment");
  const tCommon = useTranslations("common");
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
        showMessage("error", tAttachment("fileTooLarge", { maxMb: 30 }));
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
      showMessage("success", t("notificationSent"));
      // onClose()
    } catch (error) {
      showMessage("error", t("notificationError"));
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
        <h4>{t("title")}</h4>
      </button>
      <p className={styles.content__description}>{t("description")}</p>
      <div className={styles.content__evidence}>
        <Flex vertical>
          <p>{tAttachment("evidence")}</p>
          <em className="descriptionDocument">{tAttachment("required")}</em>
        </Flex>
        <Controller
          name="evidence"
          control={control}
          rules={{ required: tAttachment("evidenceRequired") }}
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
          <p>{tCommon("fields.comments")}</p>
          <em className="descriptionDocument">{tAttachment("optional")}</em>
        </Flex>
        <Controller
          name="comment"
          control={control}
          rules={{ required: false }}
          render={({ field }) => <textarea {...field} placeholder={t("commentPlaceholder")} />}
        />
      </div>
      <div className={styles.footer}>
        <SecondaryButton onClick={handleCancel}>{tCommon("actions.cancel")}</SecondaryButton>
        <PrincipalButton
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? tCommon("status.sending") : t("sendNotification")}
        </PrincipalButton>
      </div>
    </div>
  );
};

export default ModalNotIdentifiedPayment;
