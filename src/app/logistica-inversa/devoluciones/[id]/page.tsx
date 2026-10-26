import { DevolucionDetailView } from "@/modules/reverseLogistics/containers/DevolucionDetailView/DevolucionDetailView";

interface PageProps {
  params: { id: string };
}

// Sin ReverseLogisticsView: el detalle de la devolución no muestra las pestañas
// Devoluciones / Aprobaciones y trae su propio encabezado.
export default function DevolucionDetailPage({ params }: PageProps) {
  return <DevolucionDetailView id={params.id} />;
}
