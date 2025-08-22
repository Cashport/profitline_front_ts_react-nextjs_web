import { FC } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart
} from "recharts";
import dayjs from "dayjs";
import utcPlugin from "dayjs/plugin/utc";

import { useAppStore } from "@/lib/store/store";
import { capitalize } from "@/utils/utils";

import styles from "./dashboard-sells-vs-payments.module.scss";

interface DashboardSellsVsPaymentsProps {
  chartData: {
    name: string;
    ventas: any;
    bancos: any;
    recaudo: any;
  }[];
  className?: string;
}

dayjs.extend(utcPlugin);

const DashboardSellsVsPayments: FC<DashboardSellsVsPaymentsProps> = ({ chartData, className }) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p>{label}</p>
          {payload.map((item: any) => (
            <p key={item.dataKey} style={{ color: item.color }}>
              {capitalize(item.name)}: {formatMoney(item.value, { hideCurrencySymbol: true })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.name}>
        Histórico ventas vs pagos
        <div className={styles.legends}>
          <div className={styles.legend}>
            <div className={styles.circle} style={{ backgroundColor: "#000000" }}></div>
            Facturación
          </div>
          <div className={styles.legend}>
            <div className={styles.circle} style={{ backgroundColor: "#0085FF" }}></div>
            Recaudo
          </div>
          <div className={styles.legend}>
            <div className={styles.circle} style={{ backgroundColor: "#CBE71E" }}></div>
            Pagos
          </div>
        </div>
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer>
          <LineChart
            margin={{ right: 15, left: 0 }}
            barCategoryGap={10}
            data={chartData}
            barSize={20}
          >
            <XAxis padding={{ left: 20, right: 20 }} dataKey="name" scale="point" />
            <YAxis
              padding={{ top: 10 }}
              tickFormatter={(value) =>
                formatMoney(value, { hideCurrencySymbol: true, scale: 6 }) + "M"
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <CartesianGrid strokeDasharray="3 3" />
            
            {/* Línea negra para Facturación */}
            <Line type="monotone" dataKey="ventas" stroke="#000000" strokeWidth={4} />

            {/* Línea azul para Recaudo */}
            <Line type="monotone" dataKey="recaudo" stroke="#0085FF" strokeWidth={4} />

            {/* Línea verde para Pagos */}
            <Line type="monotone" dataKey="bancos" stroke="#CBE71E" strokeWidth={4} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardSellsVsPayments;
