import { FC } from "react";
import { useTranslations } from "use-intl";
import { Checkbox } from "antd";

import { useAppStore } from "@/lib/store/store";
import { DividerVerticalModal } from "../DividerVertical/DividerVerticalModal";

import "./itemsActionsModalInvoiceStyle.scss";

interface ItemsActionsModalProps {
  onHeaderClick: () => void;
  type: number;
  item: {
    id: number;
    current_value: number;
    selected: boolean;
    date: string;
  };
}

const ItemsActionsModalInvoice: FC<ItemsActionsModalProps> = ({ onHeaderClick, item, type }) => {
  const t = useTranslations("components.itemsModal");
  const formatMoney = useAppStore((state) => state.formatMoney);

  return (
    <div className="item">
      <div className="head">
        <Checkbox onChange={() => onHeaderClick()} checked={item.selected} />
        <DividerVerticalModal color={type === 1 ? "#CAE234" : "#9747FF"} />
        <div className={"texts"}>
          <div className={"mainText"}>
            <strong className={"name"}>
              <span> {t("invoice", { id: item.id })}</span>
            </strong>
          </div>
          <div className={"label"}>{item.date ?? ""}</div>
        </div>
        <div className={"mainValues"}>
          <div className={"value"}>{formatMoney(item.current_value.toString())}</div>
        </div>
      </div>
    </div>
  );
};

export default ItemsActionsModalInvoice;
