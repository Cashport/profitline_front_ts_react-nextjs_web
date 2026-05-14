import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Modal, Typography, message } from "antd";
import "./modalActionDiscountCredit.scss";
import { CreateCreditNote } from "../CreateAccountingAdjustment/CreateCreditNote/CreateCreditNote";
import { CreateDiscount } from "../CreateAccountingAdjustment/CreateDiscount/CreateDiscount";
import { CreateDebitNote } from "../CreateAccountingAdjustment/CreateDebitNote/CreateDebitNote";
// import { useAcountingAdjustment } from "@/hooks/useAcountingAdjustment";
import { IInvoice } from "@/types/invoices/IInvoices";
import { SelectAccountingAdjustment } from "../SelectAccountingAdjustment/SelectAccountingAdjustment";
import { ApplyAccountingAdjustment } from "../ApplyAccountingAdjustment/ApplyAccountingAdjustment";
import { useParams } from "next/navigation";
import { extractSingleParam } from "@/utils/utils";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  showActionDetailModal: {
    isOpen: boolean;
    actionType: number;
  };
  setShowActionDetailModal: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      actionType: number;
    }>
  >;
  invoiceSelected?: IInvoice[];
  onCloseAllModals?: () => void;
}
export interface ISelectedAccountingAdjustment {
  id: number;
  current_value: number;
  motive_name: string | null;
  percentage?: number | null;
  intialAmount?: number;
}

export const ModalActionDiscountCredit = ({
  isOpen,
  onClose,
  showActionDetailModal,
  invoiceSelected,
  onCloseAllModals
}: Props) => {
  const [selectedRows, setSelectedRows] = useState<ISelectedAccountingAdjustment[]>([]);
  const [currentView, setCurrentView] = useState("select");
  const [messageApi, contextHolder] = message.useMessage();
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const projectIdParam = extractSingleParam(params.projectId);
  useEffect(() => {
    showActionDetailModal && setSelectedRows([]);
  }, [showActionDetailModal]);

  return (
    <>
      {contextHolder}
      <Modal
        width={"40%"}
        open={isOpen}
        style={{
          height: currentView === "select" ? "calc(80vh - 20px)" : "auto"
        }}
        title={
          <Title level={4}>
            {(currentView === "create" && titleCreateMap[showActionDetailModal?.actionType || 1]) ||
              (currentView === "select" && titleMap[showActionDetailModal?.actionType || 1]) ||
              (currentView === "apply" && titleApplyMap[showActionDetailModal?.actionType || 1])}
          </Title>
        }
        footer={null}
        onCancel={
          currentView === "select"
            ? onClose
            : () => {
                setCurrentView("select");
              }
        }
      >
        {currentView === "select" && (
          <SelectAccountingAdjustment
            type={showActionDetailModal.actionType}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            onClose={onClose}
            setCurrentView={setCurrentView}
            clientIdParam={clientIdParam}
            projectIdParam={projectIdParam}
          />
        )}
        {currentView === "create" && (
          <>
            {showActionDetailModal.actionType === 1 && (
              <CreateDebitNote
                onClose={() => {
                  setCurrentView("select");
                }}
                messageApi={messageApi}
                clientIdParam={clientIdParam}
                projectIdParam={projectIdParam}
              />
            )}
            {showActionDetailModal.actionType === 2 && (
              <CreateCreditNote
                onClose={() => {
                  setCurrentView("select");
                }}
                messageApi={messageApi}
                clientIdParam={clientIdParam}
                projectIdParam={projectIdParam}
              />
            )}
            {showActionDetailModal.actionType === 3 && (
              <CreateDiscount
                onClose={() => {
                  setCurrentView("select");
                }}
                messageApi={messageApi}
                clientIdParam={clientIdParam}
                projectIdParam={projectIdParam}
              />
            )}
          </>
        )}
        {currentView === "apply" && (
          <ApplyAccountingAdjustment
            type={showActionDetailModal.actionType}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            setCurrentView={setCurrentView}
            onClosePrincipalModal={
              onCloseAllModals
                ? () => {
                    onClose();
                    setCurrentView("select");
                    onCloseAllModals();
                  }
                : onClose
            }
            invoiceSelected={invoiceSelected}
            messageApi={messageApi}
          />
        )}
      </Modal>
    </>
  );
};

const titleMap: Record<number, string> = {
  1: "Aplicar nota débito",
  2: "Aplicar nota crédito",
  3: "Aplicar descuento"
};
const titleCreateMap: Record<number, string> = {
  1: "Crear nota débito",
  2: "Crear nota crédito",
  3: "Crear descuento"
};
const titleApplyMap: Record<number, string> = {
  1: "Aplicar nota débito",
  2: "Aplicar nota crédito",
  3: "Aplicar descuento"
};
