import { FC } from "react";
import styles from "./dashboard-color-bar.module.scss";

interface DashboardColorBarProps {
  values: { color: string; percentage: number }[];
  className?: string;
  percentage?: number;
}

const DashboardColorBar: FC<DashboardColorBarProps> = ({ values, className, percentage }) => {
  const markerPosition = percentage ?? null;

  return (
    <div className={`${styles.colorBar} ${className}`}>
      {values.map((item, index) => (
        <div
          key={index}
          className={styles.segment}
          style={{
            backgroundColor: item.color,
            width: `${item.percentage}%`
          }}
        />
      ))}
      {markerPosition !== null && (
        <div
          className={styles.marker}
          style={{
            left: `${markerPosition}%`
          }}
        />
      )}
    </div>
  );
};

export default DashboardColorBar;
