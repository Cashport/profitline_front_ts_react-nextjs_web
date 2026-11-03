import { FC, useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import dayjs from "dayjs";
import useScreenWidth from "@/components/hooks/useScreenWidth";
import styles from "./dashboard-historic-dso.module.scss";

interface DashboardHistoricDsoProps {
  history_dso: historic_dso[] | undefined;
  className?: string;
  // eslint-disable-next-line no-unused-vars
  yAxisLabelFormatter?: (value: number) => string;
}

type history_chart = {
  name: string;
  month: number;
  value: number;
};

type historic_dso = {
  dso: number;
  date: string;
};

const DashboardHistoricDso: FC<DashboardHistoricDsoProps> = ({
  history_dso,
  className,
  yAxisLabelFormatter
}) => {
  const t = useTranslations("clients.dashboard.historicDso");
  const [data, setData] = useState([] as history_chart[]);
  const width = useScreenWidth();

  // Función para calcular el barSize dinámico
  const calculateBarSize = () => {
    const MIN_BAR_SIZE = 28;
    const MAX_BAR_SIZE = 62;
    const BASE_SCREEN_WIDTH = 375;

    // Usamos una función logarítmica para suavizar el crecimiento
    const growthFactor = Math.log(width / BASE_SCREEN_WIDTH + 1) * 17;

    return Math.min(MIN_BAR_SIZE + Math.floor(growthFactor), MAX_BAR_SIZE);
  };

  const monthNames = [
    t("months.jan"),
    t("months.feb"),
    t("months.mar"),
    t("months.apr"),
    t("months.may"),
    t("months.jun"),
    t("months.jul"),
    t("months.aug"),
    t("months.sep"),
    t("months.oct"),
    t("months.nov"),
    t("months.dec")
  ];

  useEffect(() => {
    if (!history_dso) {
      setData([]);
      return;
    }
    const chartData = history_dso.map((item) => {
      const date = dayjs(item.date);
      const monthIdx = date.month(); // 0-11
      return {
        name: monthNames[monthIdx],
        month: monthIdx + 1,
        value: item.dso
      };
    });
    setData(chartData);
  }, [history_dso, t]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p>{label}</p>
          <p className={styles.dsoValue}>{t("tooltip", { value: payload[0].value })}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.name}>
        {t("title")}
        <div className={styles.legends}>
          <div className={styles.legend}>
            <div className={styles.circle} style={{ backgroundColor: "#CBE71E" }}></div>
            {t("days")}
          </div>
        </div>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            margin={{ right: 0, left: -3 }}
            barCategoryGap={10}
            data={data}
            barSize={calculateBarSize()}
          >
            <XAxis padding={{ left: 39, right: 39 }} dataKey="name" scale="point" color="#CBE71E" />
            <YAxis tickFormatter={yAxisLabelFormatter} />
            <Tooltip content={<CustomTooltip />} />
            <CartesianGrid strokeDasharray="3" vertical={false} />
            <Bar dataKey="value" fill="#CBE71E" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardHistoricDso;
