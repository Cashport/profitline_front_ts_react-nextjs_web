import { FC } from "react";
import { Radio } from "antd";

import { useAppStore } from "@/lib/store/store";
import { DividerVerticalModal } from "../DividerVertical/DividerVerticalModal";

import "./itemsModalLegalize.scss";

interface ItemsModalLegalizeProps {
  onHeaderClick: () => void;
  type: number;
  item: {
    id: number;
    current_value: number;
    selected: boolean;
    motive_name?: string | undefined;
    percentage?: number | null;
    intialAmount?: number;
  };
  selectedItemId: number | null;
}

const ItemsModalLegalize: FC<ItemsModalLegalizeProps> = ({
  onHeaderClick,
  item,
  type,
  selectedItemId
}) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  return (
    <div className="item">
      <div className="head">
        <Radio onChange={() => onHeaderClick()} checked={item.id === selectedItemId} />
        <DividerVerticalModal type={type} />
        <div className={"texts"}>
          <div className={"mainText"}>
            <strong className={"name"}>
              {titleMap[type]}
              <span>{item.id}</span>
            </strong>
          </div>
          <div className={"label"}>{item.motive_name ?? "Volumen"}</div>
        </div>
        <div className={"mainValues"}>
          <div className={"value"}>{formatMoney(item.current_value.toString())}</div>
          <div className={"subValue"}>
            {item.percentage
              ? `${item.percentage}%`
              : formatMoney(item.intialAmount?.toString() ?? "")}
          </div>
        </div>
      </div>
    </div>
  );
};

const titleMap: Record<number, string> = {
  1: "Nota débito",
  2: "Nota crédito",
  3: "Descuento"
};

export default ItemsModalLegalize;
