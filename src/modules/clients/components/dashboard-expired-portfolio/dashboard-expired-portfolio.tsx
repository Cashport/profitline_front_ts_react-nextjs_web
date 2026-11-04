import { FC } from "react";
import { useTranslations } from "use-intl";
import Image from "next/image";
import styles from "./dashboard-expired-portfolio.module.scss";
import DashboardGenericItem from "../dashboard-generic-item";

interface DashboardExpiredPortfolioProps {
  pastDuePortfolio: string;
  expiredPercentage: string;
  className?: string;
}

const DashboardExpiredPortfolio: FC<DashboardExpiredPortfolioProps> = ({
  pastDuePortfolio,
  expiredPercentage,
  className
}) => {
  const t = useTranslations("clients.dashboard");
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <DashboardGenericItem
        name={t("expiredPortfolio.title")}
        badgeText={`${parseFloat(expiredPercentage).toFixed(1)}%`}
        value={pastDuePortfolio}
        unit="M"
      />
      <Image
        src="/images/graph-2.svg"
        alt={t("graphAlt")}
        className={styles.img}
        width={78}
        height={48}
      />
    </div>
  );
};

export default DashboardExpiredPortfolio;
