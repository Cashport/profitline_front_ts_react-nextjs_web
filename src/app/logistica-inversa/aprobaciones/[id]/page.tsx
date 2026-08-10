import { ReverseLogisticsView } from "@/modules/reverseLogistics/containers/ReverseLogisticsView/ReverseLogisticsView";
import { AprobacionDetalle } from "@/modules/reverseLogistics/components/AprobacionDetalle/AprobacionDetalle";

interface PageProps {
  params: { id: string };
}

export default function AprobacionResumenPage({ params }: PageProps) {
  return (
    <ReverseLogisticsView activeTab="aprobaciones">
      <AprobacionDetalle id={params.id} />
    </ReverseLogisticsView>
  );
}
