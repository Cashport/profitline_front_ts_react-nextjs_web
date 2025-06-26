import { FC, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import styles from "./dashboard-historic-dso.module.scss";
import dayjs from "dayjs";

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
  const [data, setData] = useState([] as history_chart[]);

  const monthNames = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic"
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
  }, [history_dso]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.name}>
        DSO histórico
        <div className={styles.legends}>
          <div className={styles.legend}>
            <div className={styles.circle} style={{ backgroundColor: "#CBE71E" }}></div>
            Días
          </div>
        </div>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart margin={{ right: 0, left: -3 }} barCategoryGap={10} data={data} barSize={30}>
            <XAxis padding={{ left: 20, right: 20 }} dataKey="name" scale="point" color="#CBE71E" />
            <YAxis tickFormatter={yAxisLabelFormatter} />
            <Tooltip />
            <CartesianGrid strokeDasharray="3" vertical={false} />
            <Bar dataKey="value" fill="#CBE71E" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardHistoricDso;
