import { FC } from "react";
import { useTranslations } from "use-intl";
import { Checkbox } from "antd";

import { useAppStore } from "@/lib/store/store";
import { DividerVerticalModal } from "../DividerVertical/DividerVerticalModal";

import "./itemsActionsModal.scss";
interface ItemsActionsModalProps {
  onHeaderClick: () => void;
  type: number;
  item: {
    id: number;
    current_value: number;
    selected: boolean;
    motive_name?: string | null;
    percentage?: number | null;
    intialAmount?: number;
    cp_id?: number | null;
  };
}

const ItemsActionsModal: FC<ItemsActionsModalProps> = ({ onHeaderClick, item, type }) => {
  const t = useTranslations("components.itemsModal");
  const formatMoney = useAppStore((state) => state.formatMoney);

  return (
    <div className="item">
      <div className="head">
        <Checkbox onChange={() => onHeaderClick()} checked={item.selected} />
        <DividerVerticalModal type={type} />
        <div className={"texts"}>
          <div className={"mainText"}>
            <strong className={"name"}>
              {titleMap[type] ? t(titleMap[type]) : null}
              <span>{item.id}</span>
              {item.cp_id ? <span>{` ${item.cp_id}`}</span> : ""}
            </strong>
          </div>
          <div className={"label"}>{item.motive_name ?? t("volume")}</div>
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

const titleMap: Record<number, "debitMemo" | "creditMemo" | "discount"> = {
  1: "debitMemo",
  2: "creditMemo",
  3: "discount"
};

export default ItemsActionsModal;
