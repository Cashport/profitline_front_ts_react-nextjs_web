import { FC, useState } from "react";
import { CaretDoubleRight, CaretDown } from "phosphor-react";
import { useTranslations } from "use-intl";
import styles from "./accounting-adjustments-modal.module.scss";
import AccountingAdjustmentsModalItem from "../../components/accounting-adjustments-item";
import UiSearchInput from "@/components/ui/search-input";
import UiTabs from "@/components/ui/ui-tabs";

interface AccountingAdjustmentsModalProps {
  show: boolean;
  onClose: () => void;
}

const AccountingAdjustmentsModal: FC<AccountingAdjustmentsModalProps> = ({ show, onClose }) => {
  const t = useTranslations("clients.adjustments.modal");
  const tCommon = useTranslations("common");
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>();

  return (
    <div className={`${styles.wrapper} ${show ? styles.show : styles.hide}`}>
      <div className={styles.modalTopSide}>
        <div className={styles.back} onClick={onClose}>
          <CaretDoubleRight />
        </div>
        <div className={styles.title}>{t("title")}</div>
      </div>
      <div className={styles.modalContent}>
        <UiTabs
          className={styles.tabs}
          tabs={[t("tabs.available"), t("tabs.managed")]}
          onTabClick={(index) => console.log(index)}
        />
        <div className={styles.searcher}>
          <UiSearchInput
            id="accounting-adjustments-search"
            placeholder={tCommon("placeholders.search")}
            onChange={() => {}}
          />
          <div className={styles.filterButton}>
            {tCommon("actions.filter")}
            <CaretDown className={styles.icon} />
          </div>
        </div>
        <div className={styles.listItems}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, index) => (
            <AccountingAdjustmentsModalItem
              key={index}
              isOpen={selectedItemIndex === index}
              onHeaderClick={() => setSelectedItemIndex((i) => (i === index ? undefined : index))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountingAdjustmentsModal;
