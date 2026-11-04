import { FC } from "react";
import { useTranslations } from "use-intl";
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
  const t = useTranslations("components.itemsModal");
  const formatMoney = useAppStore((state) => state.formatMoney);

  return (
    <div className="item__apply__modal">
      <div className="head">
        <DividerVerticalModal type={type} className="divider__item" />
        <div className={"texts"}>
          <div className={"mainText"}>
            <strong className={"name"}>
              {titleMap[type] ? t(titleMap[type]) : null}
              <span>{item?.id}</span>
            </strong>
          </div>
          <div className={"label"}>{item?.motive_name ?? t("volume")}</div>
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

const titleMap: Record<number, "debitMemo" | "creditMemo" | "discount"> = {
  1: "debitMemo",
  2: "creditMemo",
  3: "discount"
};

export default ItemApplyModal;
