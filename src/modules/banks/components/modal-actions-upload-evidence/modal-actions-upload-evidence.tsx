"use client";
import { useEffect, useState } from "react";
import { Modal, Typography } from "antd";
import { useTranslations } from "use-intl";
import { useForm } from "react-hook-form";

import { uploadEvidence } from "@/services/banksPayments/banksPayments";
import { useAppStore } from "@/lib/store/store";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import { useMessageApi } from "@/context/MessageContext";

import { ISingleBank } from "@/types/banks/IBanks";

import "./modal-actions-upload-evidence.scss";
const { Title } = Typography;

interface infoObject {
  file: File;
  fileList: File[];
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  selectedRows: ISingleBank[] | undefined;
}

const ModalActionsUploadEvidence = ({ isOpen, onClose, selectedRows }: Props) => {
  const t = useTranslations("banks.uploadSlip");
  const tShared = useTranslations("banks.shared");
  const tCommon = useTranslations("common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = useAppStore((state) => state.userId);
  const { showMessage } = useMessageApi();

  const { handleSubmit, setValue, watch, trigger, reset } = useForm<{
    evidence: File;
  }>();

  const evidence = watch("evidence");

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  const handleOnChangeDocument: any = (info: infoObject) => {
    const { file: rawFile } = info;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        showMessage("error", tShared("fileTooLarge", { maxMb: 30 }));
        return;
      }
      setValue("evidence", rawFile);
      trigger("evidence");
    }
  };

  const handleOnDeleteDocument = () => {
    reset();
  };

  const onSubmit = async (data: { evidence: File }) => {
    if (!selectedRows) {
      return;
    }
    setIsSubmitting(true);
    try {
      await uploadEvidence(selectedRows[0].id, userId, data.evidence);

      showMessage("success", t("success"));

      onClose();
    } catch (error) {
      showMessage("error", t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className="modalActionsUploadEvidence"
      width="50%"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      <Title level={4}>{t("title")}</Title>

      <p className="modalActionsUploadEvidence__subTitle">{t("subtitle")}</p>

      <div className="modalActionsUploadEvidence__file">
        <p>{t("slip")}</p>
        <DocumentButton
          key={evidence?.name}
          title={evidence?.name}
          handleOnChange={handleOnChangeDocument}
          handleOnDelete={() => handleOnDeleteDocument()}
          fileName={evidence?.name}
          fileSize={evidence?.size}
        />
      </div>

      <div className="modalActionsUploadEvidence__footer">
        <SecondaryButton onClick={() => onClose(true)}>{tCommon("actions.cancel")}</SecondaryButton>

        <PrincipalButton
          onClick={handleSubmit(onSubmit)}
          disabled={!evidence}
          loading={isSubmitting}
        >
          {t("title")}
        </PrincipalButton>
      </div>
    </Modal>
  );
};

export default ModalActionsUploadEvidence;
