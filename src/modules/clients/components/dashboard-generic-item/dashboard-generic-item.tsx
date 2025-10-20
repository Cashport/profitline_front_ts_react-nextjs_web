import { FC } from "react";
import styles from "./dashboard-generic-item.module.scss";
import { Flex } from "antd";

interface DashboardGenericItemProps {
  name: string;
  value: string;
  badgeText?: string;
  unit?: string;
  quantity?: number;
  color?: string;
}

const DashboardGenericItem: FC<DashboardGenericItemProps> = ({
  name,
  badgeText,
  value,
  unit,
  quantity,
  color
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>
        <Flex align="center" gap={"8px"}>
          {color && <span className={styles.coloredCircle} style={{ backgroundColor: color }} />}
          <p className={styles.text}>{name}</p>
        </Flex>
        {badgeText && <div className={styles.percentageBadge}>{badgeText}</div>}
      </div>
      <div className={styles.value}>
        <p className={styles.total}>{value}</p>
        {unit && <span>{unit}</span>}
        {quantity !== undefined && quantity !== null && quantity !== 0 && (
          <p className={styles.quantity}>{quantity}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardGenericItem;
