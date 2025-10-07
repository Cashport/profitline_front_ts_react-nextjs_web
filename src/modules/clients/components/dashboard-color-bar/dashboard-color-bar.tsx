import { FC } from "react";
import styles from "./dashboard-color-bar.module.scss";

interface DashboardColorBarProps {
  values: { color: string; percentage: number }[];
  className?: string;
}

const DashboardColorBar: FC<DashboardColorBarProps> = ({ values, className }) => {
  return (
    <div className={`${styles.colorBar} ${className}`}>
      {values.map((item, index) => (
        <div
          key={index}
          className={styles.segment}
          style={{
            backgroundColor: item.color,
            width: `${item.percentage}%`,
          }}
        />
      ))}
    </div>
  );
};

export default DashboardColorBar;
