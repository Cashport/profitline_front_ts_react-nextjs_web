import { FC } from "react";
import styles from "./ui-filter-dropdown.module.scss";
import { CaretDown } from "phosphor-react";
import { useTranslations } from "use-intl";

interface UiFilterDropdownProps {}

const UiFilterDropdown: FC<UiFilterDropdownProps> = () => {
  const tCommon = useTranslations("common");
  return (
    <div className={styles.filterButton}>
      {tCommon("actions.filter")}
      <CaretDown className={styles.icon} />
    </div>
  );
};

export default UiFilterDropdown;
