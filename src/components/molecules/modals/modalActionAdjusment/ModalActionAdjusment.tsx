import { Flex, message, Modal, Spin } from "antd";
import { CaretRight, Pencil, Trash } from "phosphor-react";
import React, { useState } from "react";
import { Gavel } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import ItemsModalLegalize from "@/components/atoms/ItemsModalLegalize/ItemsModalLegalize";
import { useAppStore } from "@/lib/store/store";
import {
  LegalizedFinancialDiscount,
  useLegalizedFinancialDiscount
} from "@/hooks/useLegalizedFinancialDiscount";
import { legalizeFinancialDiscount } from "@/services/accountingAdjustment/accountingAdjustment";

import "./modalActionAdjusment.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  adjustment: {
    type: string | undefined;
    id: string;
    amount: string;
  };
}

const extractType = (type: string | undefined) => {
  if (type === "Nota debito") {
    return 1;
  } else if (type === "Nota credito") {
    return 2;
  } else if (type === "Descuento") {
    return 3;
  }
  return 1;
};
export const ModalActionAdjusment = ({ isOpen, onClose, adjustment, clientId }: Props) => {
  const t = useTranslations("modals.actionAdjustment");
  const tShared = useTranslations("modals.shared");
  const tCommon = useTranslations("common");
  const [currentView, setCurrentView] = useState<string>("selectAccountingAdjustment");
  // adjustment.type llega en español ("Nota debito"...) y se usa en extractType: solo se traduce al mostrarlo.
  const typeLabel = (type: string | undefined) => {
    if (type === "Nota debito") return tShared("debitMemo");
    if (type === "Nota credito") return tShared("creditMemo");
    if (type === "Descuento") return tShared("discount");
    return type ?? "";
  };
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);

  const [selectIsLoading, setSelectIsLoading] = useState<boolean>(false);

  const [messageApi, contextHolder] = message.useMessage();
  // Update the handleCheckClick function
  const handleCheckClick = (item: LegalizedFinancialDiscount) => {
    setSelectedItemId(item.id);
  };

  const { data: noteData, isLoading } = useLegalizedFinancialDiscount({
    typeLegalized: 1,
    projectId,
    clientId: clientId || "0"
  });

  const handleContinue = async () => {
    if (selectedItemId !== null) {
      setSelectIsLoading(true);
      try {
        const response = await legalizeFinancialDiscount(
          {
            discount_id_legalized: selectedItemId,
            discount_id_not_legalized: +adjustment.id
          },
          projectId,
          clientId
        );
        if (response.success) {
          setSelectedItemId(null);
          messageApi.success(t("success"));
          setCurrentView("selectAccountingAdjustment");
          onClose();
        } else {
          messageApi.error(response.message || t("error"));
        }
      } catch (error: any) {
        console.error("Error in legalizeFinancialDiscount:", error);
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data.message;
          if (
            errorMessage ===
            "The current value of the financial discount to be legalized is less than the current value of the financial discount not to be legalized"
          ) {
            messageApi.error(t("insufficientValue"));
          } else {
            messageApi.error(errorMessage || t("badRequest"));
          }
        } else if (error instanceof Error) {
          messageApi.error(`Error: ${error.name}`);
        } else {
          messageApi.error(t("unknownError"));
        }
      } finally {
        setSelectIsLoading(false);
      }
    }
  };
  return (
    <Modal
      open={isOpen}
      onCancel={
        currentView === "selectAccountingAdjustment"
          ? onClose
          : () => setCurrentView("selectAccountingAdjustment")
      }
      title={
        currentView === "legalizeAccountingAdjustment" ? (
          <div className="title_modal_adjusment">
            <div> {t("pendingSettlement", { type: typeLabel(adjustment.type) })}</div>
            <div>
              {t("reference", { id: adjustment.id })} {formatMoney(adjustment.amount)}
            </div>
          </div>
        ) : (
          t("title")
        )
      }
      footer={null}
      width={"40%"}
      style={{
        height:
          currentView === "legalizeAccountingAdjustment" ? "calc(80 * var(--vh) - 20px)" : "auto"
      }}
    >
      {contextHolder}
      {currentView === "selectAccountingAdjustment" && (
        <div className="content">
          <Flex vertical gap="small">
            <button
              className="actionButton"
              onClick={() => setCurrentView("legalizeAccountingAdjustment")}
            >
              <p className="actionButton__text">
                <Gavel size={24} /> {t("settle")}
              </p>
              <CaretRight className="actionButton__caretRight" />
            </button>
            {/* <button
              className="actionButton"
              onClick={() => setCurrentView("editAccountingAdjustment")}
            >
              <p className="actionButton__text">
                <Pencil size={24} />
                Editar ajuste contable
              </p>
              <CaretRight className="actionButton__caretRight" />
            </button>
            <button
              className="actionButton"
              onClick={() => setCurrentView("deleteAccountingAdjustment")}
            >
              <p className="actionButton__text">
                <Trash size={24} />
                Eliminar ajuste contable
              </p>
              <CaretRight className="actionButton__caretRight" />
            </button> */}
          </Flex>
        </div>
      )}
      {currentView === "legalizeAccountingAdjustment" && (
        <div className="mal-modalContent">
          <p className="mal-subTitleModalAction">
            {t(subtitleMap[extractType(adjustment.type) || 1] ?? subtitleMap[1])}
          </p>
          <Flex vertical gap="small" className="mal-conten_modal_select_ajust">
            <div className="mal-modalContentScroll">
              {isLoading ? (
                <Spin size="large" style={{ margin: "auto" }} />
              ) : (
                noteData?.map((item, index) => (
                  <ItemsModalLegalize
                    key={index}
                    item={{
                      id: item.id,
                      current_value: item.current_value,
                      selected: selectedItemId === item.id,
                      intialAmount: item.initial_value,
                      motive_name: item.document_type_name,
                      percentage: null
                    }}
                    type={extractType(adjustment.type) || 1}
                    onHeaderClick={() => handleCheckClick(item)}
                    selectedItemId={selectedItemId}
                  />
                ))
              )}
            </div>
            <Flex gap="8px" className="mal-container__button">
              <button
                type="button"
                className="button__action__text button__action__text__white"
                onClick={() => setCurrentView("selectAccountingAdjustment")}
              >
                {tCommon("actions.cancel")}
              </button>
              <button
                type="button"
                className={`mal-button__action__text ${
                  selectedItemId !== null && !selectIsLoading
                    ? "mal-button__action__text__green"
                    : ""
                }`}
                onClick={handleContinue}
                disabled={selectedItemId === null || selectIsLoading}
              >
                {selectIsLoading ? tCommon("status.processing") : tCommon("actions.continue")}
              </button>
            </Flex>
          </Flex>
        </div>
      )}
      {currentView === "editAccountingAdjustment" && (
        <div className="content">
          <Flex vertical gap="small">
            <button
              className="actionButton"
              onClick={() => setCurrentView("selectAccountingAdjustment")}
            >
              <p className="actionButton__text">
                <Pencil size={24} />
                {t("edit")}
              </p>
              <CaretRight className="actionButton__caretRight" />
            </button>
          </Flex>
        </div>
      )}
      {currentView === "deleteAccountingAdjustment" && (
        <div className="content">
          <Flex vertical gap="small">
            <button
              className="actionButton"
              onClick={() => setCurrentView("selectAccountingAdjustment")}
            >
              <p className="actionButton__text">
                <Trash size={24} />
                {t("delete")}
              </p>
              <CaretRight className="actionButton__caretRight" />
            </button>
          </Flex>
        </div>
      )}
    </Modal>
  );
};

const subtitleMap: Record<number, "selectDebitMemos" | "selectCreditMemos" | "selectDiscounts"> = {
  1: "selectDebitMemos",
  2: "selectCreditMemos",
  3: "selectDiscounts"
};
