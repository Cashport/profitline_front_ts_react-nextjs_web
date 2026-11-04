import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Modal, Typography, message } from "antd";
import { useTranslations } from "use-intl";
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
  const t = useTranslations("modals.actionDiscountCredit");
  const [selectedRows, setSelectedRows] = useState<ISelectedAccountingAdjustment[]>([]);
  const actionType = showActionDetailModal?.actionType || 1;
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
          height: currentView === "select" ? "calc(80 * var(--vh) - 20px)" : "auto"
        }}
        title={
          <Title level={4}>
            {(currentView === "create" &&
              titleCreateMap[actionType] &&
              t(titleCreateMap[actionType])) ||
              ((currentView === "select" || currentView === "apply") &&
                titleApplyMap[actionType] &&
                t(titleApplyMap[actionType]))}
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

const titleCreateMap: Record<number, "createDebitMemo" | "createCreditMemo" | "createDiscount"> = {
  1: "createDebitMemo",
  2: "createCreditMemo",
  3: "createDiscount"
};
// "select" y "apply" usan el mismo título.
const titleApplyMap: Record<number, "applyDebitMemo" | "applyCreditMemo" | "applyDiscount"> = {
  1: "applyDebitMemo",
  2: "applyCreditMemo",
  3: "applyDiscount"
};
