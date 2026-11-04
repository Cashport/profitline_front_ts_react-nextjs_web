import { FC } from "react";
import { useTranslations } from "use-intl";
import { Poppins } from "next/font/google";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import { useAppStore } from "@/lib/store/store";

import styles from "./dashboard-porfolio-ages.module.scss";
import DashboardGenericItem from "../dashboard-generic-item";
const poppins = Poppins({ weight: "400", style: "normal", subsets: ["latin"] });

interface DashboardPortfolioAgesProps {
  invoiceAges:
    | {
        name: string;
        data: number[] | { x: number; y: number }[];
      }[]
    | undefined;
  className?: string;
  pastDuePortfolio?: string;
}

const DashboardPortfolioAges: FC<DashboardPortfolioAgesProps> = ({
  invoiceAges,
  className,
  pastDuePortfolio = "0"
}) => {
  const t = useTranslations("clients.dashboard.portfolioAges");
  const formatMoney = useAppStore((state) => state.formatMoney);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      stackType: "100%",
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: [""],
      labels: {
        show: false
      }
    },
    yaxis: {
      labels: {
        maxWidth: 30,
        offsetX: 10,
        offsetY: -5,
        align: "right",
        style: {
          cssClass: styles.yAxis
        }
      }
    },
    dataLabels: {
      style: {
        fontFamily: poppins.style.fontFamily,
        fontWeight: 400,
        colors: ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#141414", "#141414", "#141414"]
      }
    },
    colors: ["#141414", "#4F4F4F", "#6E7B57", "#86A600", "#A8C600", "#CBE71E"],
    stroke: {
      show: false
    },
    tooltip: {
      y: {
        formatter: (val) => {
          return formatMoney(val);
        }
      }
    },
    fill: {
      opacity: 1
    },
    legend: {
      show: false
    },
    grid: {
      strokeDashArray: 3
    }
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <DashboardGenericItem name={t("title")} value={pastDuePortfolio} unit="M" />
      <div className={styles.chart}>
        <ReactApexChart
          className=""
          options={options}
          series={invoiceAges}
          type="bar"
          height={270}
          key={Math.random()}
        />
      </div>

      <div className={styles.legends}>
        <div className={styles.legend}>
          <div className={styles.circle} style={{ backgroundColor: "#CBE71E" }}></div>
          {t("current")}
        </div>
        <div className={styles.legend}>
          <div className={styles.circle} style={{ backgroundColor: "#A8C600" }}></div>
          {t("days", { days: 30 })}
        </div>
        <div className={styles.legend}>
          <div className={styles.circle} style={{ backgroundColor: "#86A600" }}></div>
          {t("days", { days: 60 })}
        </div>
        <div className={styles.legend}>
          <div className={styles.circle} style={{ backgroundColor: "#6E7B57" }}></div>
          {t("days", { days: 90 })}
        </div>
        <div className={styles.legend}>
          <div className={styles.circle} style={{ backgroundColor: "#4F4F4F" }}></div>
          {t("days", { days: 120 })}
        </div>
        <div className={styles.legend}>
          <div className={styles.circle} style={{ backgroundColor: "#141414" }}></div>
          {t("over", { days: 120 })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPortfolioAges;
