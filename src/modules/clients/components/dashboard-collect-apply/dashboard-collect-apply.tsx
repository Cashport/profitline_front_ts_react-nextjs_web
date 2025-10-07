import { FC } from "react";
import DashboardGenericItem from "../dashboard-generic-item";
import DashboardColorBar from "../dashboard-color-bar";

interface DashboardCollectApplyProps {
  className?: string;
}

const DashboardCollectApply: FC<DashboardCollectApplyProps> = ({ className }) => {
  const colorBarValues = [{ color: "#cbe71e", percentage: 100 }];

  return (
    <div className={`${className}`}>
      <DashboardGenericItem name="Meta de recaudo" value={"100.000"} unit="M" badgeText="162%" />

      <DashboardColorBar values={colorBarValues} percentage={70} />

      <DashboardGenericItem name="Total aplicado" value={"162.370"} unit="M" />

      <DashboardGenericItem name="Pend. Aplicación" value={"29.680"} unit="M" quantity={628} />

      <DashboardGenericItem name="Pagos no aplicados" value={"30.945"} unit="M" quantity={751} />
    </div>
  );
};

export default DashboardCollectApply;
