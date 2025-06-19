import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./selectAccountingAdjustment.scss";
import { Flex, Spin } from "antd";
import { ISelectedAccountingAdjustment } from "../ModalActionDiscountCredit/ModalActionDiscountCredit";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import ItemsActionsModal from "@/components/atoms/ItemsModal/ItemsActionsModal";
import { Plus } from "phosphor-react";
import { useAcountingAdjustment } from "@/hooks/useAcountingAdjustment";

interface Props {
  type: number;
  selectedRows: ISelectedAccountingAdjustment[];
  setSelectedRows: Dispatch<SetStateAction<ISelectedAccountingAdjustment[]>>;
  onClose: () => void;
  setCurrentView: Dispatch<SetStateAction<string>>;
  clientIdParam?: string;
  projectIdParam?: string;
}
interface ItemsSelected {
  id: number;
  current_value: number;
  selected: boolean;
  motive_name: string | null;
  percentage?: number | null;
  intialAmount?: number;
  cp_id?: number | null;
}

export const SelectAccountingAdjustment = ({
  type,
  selectedRows,
  onClose,
  setCurrentView,
  setSelectedRows,
  clientIdParam,
  projectIdParam
}: Props) => {
  const { data, isLoading } = useAcountingAdjustment(
    clientIdParam || "0",
    projectIdParam || "0",
    type
  );
  const [dateSelect, setDateSelect] = useState<ItemsSelected[]>([]);
  const handleCheckClick = (item: ISelectedAccountingAdjustment) => {
    const isExist = selectedRows.some((row) => row.id === item.id);
    if (isExist) setSelectedRows((prevRows) => prevRows.filter((row) => row.id !== item.id));
    else setSelectedRows((prevRows) => [...prevRows, item]);
  };

  useEffect(() => {
    const concatData = [
      ...(data?.[0]?.financial_discounts ?? []),
      ...(data?.[1]?.financial_discounts ?? [])
    ];
    if (data) {
      setDateSelect(
        concatData
          .sort((a, b) => Date.parse(b.create_at) - Date.parse(a.create_at))
          .map((item) => ({
            id: item.id,
            current_value: item.current_value,
            selected: selectedRows.some((row) => row.id === item.id),
            motive_name: item.motive_name,
            percentage: item.percentage,
            intialAmount: item.initial_value,
            cp_id: item.cp_id
          }))
      );
    }
  }, [data, selectedRows]);

  return (
    <div className="modalContent">
      <p className="subTitleModalAction">{subtitleMap[type || 1]}</p>
      <Flex vertical className="conten_modal_select_ajust">
        <div className="modalContentScroll">
          {isLoading ? (
            <Spin size="large" style={{ margin: "auto" }} />
          ) : (
            dateSelect?.map((item, index) => (
              <ItemsActionsModal
                key={index}
                item={item}
                type={type || 1}
                onHeaderClick={() => handleCheckClick(item)}
              />
            ))
          )}
        </div>
        <Flex vertical>
          <button
            type="button"
            className="button__create__action"
            onClick={() => setCurrentView("create")}
          >
            <Plus /> Crear {typeMap[type || 1]}
          </button>
          <FooterButtons
            handleOk={() => {
              selectedRows.length > 0 && setCurrentView("apply");
            }}
            onClose={onClose}
            isConfirmDisabled={!selectedRows.length}
            titleConfirm="Continuar"
          />
        </Flex>
      </Flex>
    </div>
  );
};

const typeMap: Record<number, string> = {
  1: "débito",
  2: "crédito",
  3: "descuento"
};

const subtitleMap: Record<number, string> = {
  1: "Selecciona la(s) nota(s) débito a aplicar",
  2: "Selecciona la(s) nota(s) crédito a aplicar",
  3: "Selecciona los descuento a aplicar"
};
