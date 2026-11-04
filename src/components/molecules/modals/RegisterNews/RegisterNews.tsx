import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { CaretLeft } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { reportInvoiceIncident } from "@/services/accountingAdjustment/accountingAdjustment";

import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";
import { InputFormMoney } from "@/components/atoms/inputs/InputFormMoney/InputFormMoney";
import ModalAttachEvidence from "../ModalEvidence/ModalAttachEvidence";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { IInvoice } from "@/types/invoices/IInvoices";
import { ApiError } from "@/utils/api/api";

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

interface IFormRegisterNews {
  motive: string;
  commentary: string;
  evidence: File[];
  amount?: string;
}

const RegisterNews = ({
  isOpen,
  onClose,
  clientId,
  invoiceSelected,
  messageShow,
  onCloseAllModals
}: RegisterNewsProps) => {
  const t = useTranslations("modals.registerNews");
  const tCommon = useTranslations("common");
  const { data: motives, isLoading, isError } = useInvoiceIncidentMotives();
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIncidentConfirmation, setShowIncidentConfirmation] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<IFormRegisterNews | null>(null);

  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<IFormRegisterNews>({});

  const handleActiveIncidentsResponse = (error: unknown) => {
    if (
      error instanceof ApiError &&
      error.status === 500 &&
      Array.isArray(error.data?.activeIncidentDocuments) &&
      error.data.activeIncidentDocuments.length > 0
    ) {
      return true;
    }
    return false;
  };

  const submitIncident = async (data: IFormRegisterNews, createNew = false) => {
    setIsSubmitting(true);
    try {
      await reportInvoiceIncident(
        invoiceSelected?.map((invoice) => invoice.id) || [],
        commentary || "",
        motives?.find((motive) => motive.name === data.motive)?.id.toString() || "",
        selectedEvidence,
        clientId?.toString() || "",
        projectId.toString(),
        data.amount,
        createNew
      );
      messageShow.success(t("success"));
      reset();
      setSelectedEvidence([]);
      setCommentary(undefined);
      setLastSubmittedData(null);
      setShowIncidentConfirmation(false);
      onCloseAllModals();
    } catch (error) {
      console.error("Error al registrar una novedad:", error);
      // Only show the confirmation modal on the FIRST attempt.
      // On resubmit, any error should just close the modal and show a toast.
      if (!createNew && handleActiveIncidentsResponse(error)) {
        setLastSubmittedData(data);
        setShowIncidentConfirmation(true);
      } else {
        messageShow.error(t("error"));
        setShowIncidentConfirmation(false);
        setLastSubmittedData(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: IFormRegisterNews) => submitIncident(data);

  const handleCreateNewIncident = () => {
    // Use the captured data and resubmit with create_new=true
    if (lastSubmittedData) submitIncident(lastSubmittedData, true);
  };

  const handleCloseIncidentConfirmation = () => {
    setShowIncidentConfirmation(false);
    setLastSubmittedData(null);
  };

  const handleClose = () => {
    reset();
    setSelectedEvidence([]);
    setCommentary(undefined);
    setLastSubmittedData(null);
    setShowIncidentConfirmation(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedEvidence([]);
      setCommentary(undefined);
      setLastSubmittedData(null);
      setShowIncidentConfirmation(false);
      reset();
    }
  }, [isOpen]);

  return (
    <>
      <Modal
        className="contentRegisterNews"
        width="50%"
        footer={null}
        open={isOpen}
        closable={false}
      >
        <button className="contentRegisterNews__header" onClick={handleClose}>
          <CaretLeft size="1.25rem" />
          <h4>{t("title")}</h4>
        </button>
        <p className="contentRegisterNews__description">{t("description")}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="contentRegisterNews__form">
          <div className="contentRegisterNews__select">
            <InputSelect
              titleInput={t("reason")}
              nameInput="motive"
              control={control}
              error={errors.motive}
              options={
                motives?.map((motive) => ({
                  value: motive?.name,
                  label: motive?.name,
                  title: motive?.description
                })) || []
              }
              loading={isLoading}
              isError={isError}
              placeholder={t("reasonPlaceholder")}
              popupMatchSelectWidth={false}
            />
            <InputFormMoney
              titleInput={t("amount")}
              nameInput="amount"
              control={control}
              error={errors.amount}
              placeholder={t("amountPlaceholder")}
              typeInput="number"
              customStyle={{ width: "100%" }}
              validationRules={{ required: false }}
            />
            <div />
          </div>
          <ModalAttachEvidence
            selectedEvidence={selectedEvidence}
            setSelectedEvidence={setSelectedEvidence}
            handleAttachEvidence={handleSubmit(onSubmit)}
            commentary={commentary}
            setCommentary={setCommentary}
            isOpen={true}
            handleCancel={handleClose}
            customTexts={{
              title: t("title"),
              description: t("description"),
              cancelButtonText: tCommon("actions.cancel"),
              acceptButtonText: isSubmitting ? tCommon("status.sending") : tCommon("actions.save")
            }}
            noTitle
            noDescription
            multipleFiles
            loading={isSubmitting}
            confirmDisabled={!commentary || !isValid}
            isMandatory={{ evidence: false, commentary: true }}
            noModal
          />
        </form>
      </Modal>
      {/* Must stay outside <Modal>: antd stops re-rendering a closed Modal's children, so closing
        both in the same update left this confirm open with its button loading */}
      <ModalConfirmAction
        isOpen={showIncidentConfirmation}
        onClose={handleCloseIncidentConfirmation}
        onOk={handleCreateNewIncident}
        title={t("openDisputes.title")}
        okText={t("openDisputes.ok")}
        cancelText={t("openDisputes.cancel")}
        okLoading={isSubmitting}
      />
    </>
  );
};

export default RegisterNews;
