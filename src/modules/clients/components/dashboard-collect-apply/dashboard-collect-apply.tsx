import { FC } from "react";
import DashboardGenericItem from "../dashboard-generic-item";
import DashboardColorBar from "../dashboard-color-bar";

interface DashboardCollectApplyProps {
  className?: string;
  collection?: string;
  totalApplied?: string;
  pendingApplication?: string;
  unidentifiedPayments?: string;
}

const DashboardCollectApply: FC<DashboardCollectApplyProps> = ({
  className,
  collection = "$0",
  totalApplied = "$0",
  pendingApplication = "$0",
  unidentifiedPayments = "$0"
}) => {
  const parseMoney = (value: string): number => {
    if (!value) return 0;

    const normalized = value
      .replace(/\./g, "") // 1. Quita los puntos de miles: "7.219,2" -> "7219,2"
      .replace(",", ".") // 2. Cambia coma por punto: "7219,2" -> "7219.2"
      .replace(/[^0-9.-]+/g, ""); // 3. Limpia basura ($ o espacios)

    return parseFloat(normalized) || 0;
  };

  const collectionValue = parseMoney(collection);
  const totalAppliedValue = parseMoney(totalApplied);

  const percentage =
    collectionValue > 0 ? Math.min((totalAppliedValue / collectionValue) * 100, 100) : 0;

  const colorBarValues = [{ color: "#cbe71e", percentage: 100 }];

  return (
    <div className={`${className}`}>
      <DashboardGenericItem
        name="Meta de recaudo"
        value={collection}
        unit="M"
        badgeText={`${percentage.toFixed(1)}%`}
      />

      <DashboardColorBar values={colorBarValues} percentage={percentage} />

      <DashboardGenericItem name="Total aplicado" value={totalApplied} unit="M" />

      <DashboardGenericItem name="Pend. Aplicación" value={pendingApplication} unit="M" />

      <DashboardGenericItem name="Pagos no identificados" value={unidentifiedPayments} unit="M" />
    </div>
  );
};

export default DashboardCollectApply;
