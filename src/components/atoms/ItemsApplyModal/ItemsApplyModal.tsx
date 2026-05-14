import { FC } from "react";
import { useAppStore } from "@/lib/store/store";
import { DividerVerticalModal } from "../DividerVertical/DividerVerticalModal";

import "./itemsApplyModal.scss";
interface ItemsApplyModalProps {
  type: number;
  item: {
    id: number;
    current_value: number;
    motive_name?: string | null;
    percentage?: number | null;
    intialAmount?: number;
  };
  availableValue?: number;
}

const ItemApplyModal: FC<ItemsApplyModalProps> = ({ item, type, availableValue }) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  return (
    <div className="item__apply__modal">
      <div className="head">
        <DividerVerticalModal type={type} className="divider__item" />
        <div className={"texts"}>
          <div className={"mainText"}>
            <strong className={"name"}>
              {titleMap[type]}
              <span>{item?.id}</span>
            </strong>
          </div>
          <div className={"label"}>{item?.motive_name ?? "Volumen"}</div>
        </div>
        <div className={"mainValues"}>
          <div className={"value"}>{formatMoney(availableValue?.toString() ?? "")}</div>
          <div className={"subValue"}>
            {item?.percentage
              ? `${item?.percentage}%`
              : formatMoney(item?.intialAmount?.toString() ?? "")}
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

export default ItemApplyModal;
