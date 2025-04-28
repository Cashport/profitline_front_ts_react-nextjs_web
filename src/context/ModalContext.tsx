"use Client";
import React, { createContext, useContext, useState, ReactNode } from "react";

import InvoiceDetailModal from "@/modules/clients/containers/invoice-detail-modal";
import ModalDetailAdjustment from "@/components/molecules/modals/ModalDetailAdjustment/ModalDetailAdjustment";
import MoldalNoveltyDetail from "@/components/molecules/modals/MoldalNoveltyDetail/MoldalNoveltyDetail";
import ModalDetailPayment from "@/components/molecules/modals/ModalDetailPayment/ModalDetailPayment";
import { ModalSendEmail } from "@/components/molecules/modals/ModalSendEmail/ModalSendEmail";

import { IInvoice } from "@/types/invoices/IInvoices";
import { FinancialDiscount } from "@/types/financialDiscounts/IFinancialDiscounts";
import { ISingleBank } from "@/types/banks/IBanks";
import { IClientPayment } from "@/types/clientPayments/IClientPayments";

type ModalType = "invoice" | "novelty" | "adjustment" | "payment" | "sendEmail" | null;

interface InvoiceModalProps {
  invoiceId: number;
  clientId: string;
  showId: string;
  hiddenActions?: boolean;
  // eslint-disable-next-line no-unused-vars
  handleActionInDetail?: (invoice: IInvoice) => void;
  selectInvoice?: IInvoice;
  projectId?: number;
}

interface NoveltyModalProps {
  noveltyId: number;
}

interface AdjustmentModalProps {
  clientId: string;
  selectAdjusment?: FinancialDiscount;
  projectId: number;
  legalized?: boolean;
  adjusmentId?: number;
}

interface ModalDetailPaymentProps {
  paymentId: number;
  // eslint-disable-next-line no-unused-vars
  handleActionInDetail?: (selectedPayment: ISingleBank | IClientPayment) => void;
  // eslint-disable-next-line no-unused-vars
  handleOpenPaymentDetail?: (paymentId: number) => void;
  mutatedPaymentDetail?: boolean;
}

interface ModalSendEmailProps {
  event_id: string;
  onFinalOk?: () => void;
  customOnReject?: () => void;
}

type ModalProps =
  | InvoiceModalProps
  | NoveltyModalProps
  | AdjustmentModalProps
  | ModalDetailPaymentProps
  | ModalSendEmailProps;

interface ModalContextType {
  // eslint-disable-next-line no-unused-vars
  openModal: (type: ModalType, props: ModalProps) => void;
  closeModal: () => void;
  modalType: ModalType;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalProps, setModalProps] = useState<ModalProps | null>(null);

  const openModal = (type: ModalType, props: ModalProps) => {
    setModalType(type);
    setModalProps(props);
  };

  const closeModal = () => {
    setModalType(null);
    setModalProps(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, modalType }}>
      {children}
      {modalType === "invoice" && modalProps && (
        <InvoiceDetailModal
          isOpen={true}
          onClose={closeModal}
          {...(modalProps as InvoiceModalProps)}
        />
      )}
      {modalType === "novelty" && modalProps && (
        <MoldalNoveltyDetail
          isOpen={true}
          onClose={closeModal}
          {...(modalProps as NoveltyModalProps)}
        />
      )}
      {modalType === "adjustment" && modalProps && (
        <ModalDetailAdjustment
          isOpen={true}
          onClose={closeModal}
          {...(modalProps as AdjustmentModalProps)}
        />
      )}
      {modalType === "payment" && modalProps && (
        <ModalDetailPayment
          isOpen={true}
          onClose={closeModal}
          {...(modalProps as ModalDetailPaymentProps)}
        />
      )}
      {modalType === "sendEmail" && modalProps && (
        <ModalSendEmail
          isOpen={true}
          onClose={closeModal}
          {...(modalProps as ModalSendEmailProps)}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModalDetail = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
