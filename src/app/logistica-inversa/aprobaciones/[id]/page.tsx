import { ReverseLogisticsView } from "@/modules/reverseLogistics/containers/ReverseLogisticsView/ReverseLogisticsView";
import { AprobacionDetalleView } from "@/modules/reverseLogistics/containers/AprobacionDetalleView/AprobacionDetalleView";

interface PageProps {
  params: { id: string };
}

export default function AprobacionResumenPage({ params }: PageProps) {
  return (
    <ReverseLogisticsView activeTab="aprobaciones">
      <AprobacionDetalleView id={params.id} />
    </ReverseLogisticsView>
  );
}
