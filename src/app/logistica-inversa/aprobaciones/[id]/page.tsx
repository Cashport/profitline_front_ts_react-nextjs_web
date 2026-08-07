import { ReverseLogisticsView } from "@/modules/reverseLogistics/containers/ReverseLogisticsView/ReverseLogisticsView";
import { AprobacionResumenView } from "@/modules/reverseLogistics/containers/AprobacionResumenView/AprobacionResumenView";

interface PageProps {
  params: { id: string };
}

export default function AprobacionResumenPage({ params }: PageProps) {
  return (
    <ReverseLogisticsView activeTab="aprobaciones">
      <AprobacionResumenView id={params.id} />
    </ReverseLogisticsView>
  );
}