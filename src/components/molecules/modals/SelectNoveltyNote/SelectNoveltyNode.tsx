import React, { Dispatch, SetStateAction } from "react";
import "./selecnoveltynote.scss";
import { Flex, Spin } from "antd";
import ItemsActionsModal from "@/components/atoms/ItemsModal/ItemsActionsModal";
import { useAcountingAdjustment } from "@/hooks/useAcountingAdjustment";

interface Props {
  type: number;
  selectedNotes: any[];
  setSelectedNotes: Dispatch<SetStateAction<any[]>>;
  onClose: () => void;
  onContinue: () => void;
  clientId?: string;
  projectId?: number;
}

export const SelectNoveltyNode: React.FC<Props> = ({
  type,
  selectedNotes,
  setSelectedNotes,
  onClose,
  onContinue,
  clientId,
  projectId
}) => {
  const { data, isLoading } = useAcountingAdjustment(
    clientId?.toString() || "",
    projectId?.toString() || "",
    type
  );

  const handleNoteSelection = (item: any) => {
    setSelectedNotes((prevNotes) =>
      prevNotes.some((note) => note.id === item.id)
        ? prevNotes.filter((note) => note.id !== item.id)
        : [...prevNotes, item]
    );
  };

  const concatData = data?.[0]?.financial_discounts;
  return (
    <div className="acn-modalContent">
      <Flex vertical className="acn-content-modal-select-note">
        <div>
          <p className="acn-subTitleModalAction">{titleApplyMap[type || 1]}</p>
          <div className="acn-modalContentScroll">
            {isLoading ? (
              <Spin size="large" style={{ margin: "auto" }} />
            ) : (
              concatData?.map((item, index) => (
                <ItemsActionsModal
                  key={index}
                  item={{
                    id: item.id,
                    current_value: item.current_value,
                    selected: selectedNotes.some((note) => note.id === item.id),
                    motive_name: item.motive_name,
                    percentage: item.percentage
                  }}
                  type={type}
                  onHeaderClick={() => handleNoteSelection(item)}
                />
              ))
            )}
          </div>
        </div>
        <Flex gap="8px" justify="flex-end">
          <button
            type="button"
            className="acn-button-action-text acn-button-action-text--white"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`acn-button-action-text ${
              selectedNotes.length > 0 ? "acn-button-action-text--green" : ""
            }`}
            onClick={onContinue}
            disabled={selectedNotes.length === 0}
          >
            Continuar
          </button>
        </Flex>
      </Flex>
    </div>
  );
};

const titleApplyMap: Record<number, string> = {
  1: "Selecciona la(s) nota(s) débito a aplicar",
  2: "Selecciona la(s) nota(s) crédito a aplicar",
  3: "Selecciona los descuentos a aplicar"
};
