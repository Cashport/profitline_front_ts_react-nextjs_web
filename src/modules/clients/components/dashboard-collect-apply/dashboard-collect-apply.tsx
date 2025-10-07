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
      <DashboardGenericItem name="Meta de recaudo" value={"$0"} unit="M" badgeText="0%" />

      <DashboardColorBar values={colorBarValues} percentage={70} />

      <DashboardGenericItem name="Total aplicado" value={"$0"} unit="M" />

      <DashboardGenericItem name="Pend. Aplicación" value={"$0"} unit="M" quantity={0} />

      <DashboardGenericItem name="Pagos no aplicados" value={"$0"} unit="M" quantity={0} />
    </div>
  );
};

export default DashboardCollectApply;
