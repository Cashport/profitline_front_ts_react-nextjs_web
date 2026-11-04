"use client";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "antd";
import { useTranslations } from "use-intl";
import {
  ArrowLeftRight,
  DollarSign,
  Shuffle,
  FileCheck,
  FileText,
  FileEdit,
  Diamond,
  RefreshCcw,
  Pencil,
  Send,
  Link2
} from "lucide-react";

import ActionTile from "@/components/ui/action-tile/action-tile";
import ActionTileGroup from "@/components/ui/action-tile/action-tile-group";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  /** Reservado para "Ajustes contables" (deshabilitado por ahora, ver comentario abajo). */
  setShowActionDetailModal: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      actionType: number;
    }>
  >;
  validateInvoiceIsSelected: () => boolean;
  setSelectOpen: Dispatch<SetStateAction<{ selected: number }>>;
  addInvoicesToApplicationTable: () => void;
  markAsBalance: () => void;
}

export const ModalGenerateAction = ({
  isOpen,
  onClose,
  clientId,
  validateInvoiceIsSelected,
  setSelectOpen,
  addInvoicesToApplicationTable,
  markAsBalance
}: Props) => {
  const t = useTranslations("modals.generateAction");
  const router = useRouter();

  // "Ajustes contables" queda deshabilitado hasta definir cómo se elige el subtipo
  // (1 = nota débito, 2 = nota crédito, 3 = descuento). El flujo anterior abría
  // ModalActionDiscountCredit así:
  // const handleActionDetail = (type: number) => {
  //   if (validateInvoiceIsSelected()) {
  //     setShowActionDetailModal({ isOpen: true, actionType: type });
  //   }
  // };

  const handleOpenModal = (type: number) => {
    const noNeedForValidation = [7, 8, 9];
    if (noNeedForValidation.includes(type)) {
      setSelectOpen({
        selected: type
      });
      return;
    }
    if (validateInvoiceIsSelected()) {
      setSelectOpen({
        selected: type
      });
    }
  };

  return (
    <Modal
      width={720}
      open={isOpen}
      centered
      title={
        <div className="pr-6">
          <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm font-normal text-muted-foreground">{t("description")}</p>
        </div>
      }
      footer={null}
      onCancel={onClose}
    >
      <div className="mt-5 space-y-5">
        <ActionTileGroup title={t("groups.payments")} tone="emerald">
          <ActionTile
            icon={<ArrowLeftRight />}
            label={t("paymentPlan")}
            tone="emerald"
            onClick={() => handleOpenModal(6)}
          />
          <ActionTile
            icon={<DollarSign />}
            label={t("applyPayments")}
            tone="emerald"
            onClick={() => addInvoicesToApplicationTable()}
          />
          <ActionTile
            icon={<Shuffle />}
            label={t("bulkReconciliation")}
            tone="emerald"
            onClick={() => router.push(`/reconciliation/${clientId}`)}
          />
          <ActionTile
            icon={<FileCheck />}
            label={t("markAsDeduction")}
            tone="emerald"
            onClick={() => {
              if (validateInvoiceIsSelected()) {
                markAsBalance();
              }
            }}
          />
        </ActionTileGroup>

        <ActionTileGroup title={t("groups.billing")} tone="blue">
          <ActionTile
            icon={<FileText />}
            label={t("submitInvoice")}
            tone="blue"
            onClick={() => handleOpenModal(3)}
          />
          <ActionTile icon={<FileEdit />} label={t("accountingAdjustments")} tone="blue" disabled />
        </ActionTileGroup>

        <ActionTileGroup title={t("groups.case")} tone="violet">
          <ActionTile
            icon={<Diamond />}
            label={t("registerDispute")}
            tone="violet"
            onClick={() => handleOpenModal(1)}
          />
          <ActionTile
            icon={<RefreshCcw />}
            label={t("changeStatus")}
            tone="violet"
            onClick={() => handleOpenModal(2)}
          />
          <ActionTile
            icon={<Pencil />}
            label={t("logActivity")}
            tone="violet"
            onClick={() => handleOpenModal(9)}
          />
        </ActionTileGroup>

        <ActionTileGroup title={t("groups.send")} tone="orange">
          <ActionTile
            icon={<Send />}
            label={t("accountStatement")}
            tone="orange"
            onClick={() => handleOpenModal(7)}
          />
          <ActionTile
            icon={<Link2 />}
            label={t("sendLink")}
            tone="orange"
            onClick={() => handleOpenModal(8)}
          />
        </ActionTileGroup>
      </div>
    </Modal>
  );
};
