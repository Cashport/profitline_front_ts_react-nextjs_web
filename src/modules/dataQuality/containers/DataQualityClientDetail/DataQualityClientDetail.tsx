"use client";

import { useState } from "react";

import { Edit, ArrowLeft, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/modules/chat/ui/button";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { ModalDataIntake } from "../../components/modal-data-intake";
import { ClientDetailInfo } from "../../components/ClientDetailInfo";
import { ClientDetailTable } from "../../components/ClientDetailTable";
import { useDataQualityClientDetail } from "../../hooks/useDataQualityClientDetail";
import { useAppStore } from "@/lib/store/store";

// Helper functions for data transformation
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date
    .toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
    .replace(",", "");
};

const parseDetailFuente = (detalle: string): Array<{ key: string; value: string }> => {
  try {
    const parsed = JSON.parse(detalle);
    return Object.entries(parsed).map(([key, value]) => ({
      key,
      value: String(value)
    }));
  } catch {
    return [{ key: "", value: detalle }];
  }
};

type IModalState = { isOpen: boolean; mode: "create" | "edit" };

export default function DataQualityClientDetails() {
  const params = useParams();
  const router = useRouter();
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);

  const clientId = params.clientId as string;
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state with discriminated union for type safety
  const [modalState, setModalState] = useState<IModalState>({ isOpen: false, mode: "create" });

  // Fetch client detail data using SWR hook
  const { clientDetail, isLoading, error } = useDataQualityClientDetail(clientId, projectId);

  // Handle loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F7F7F7" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F7F7F7" }}
      >
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-semibold">Error al cargar los datos</h2>
          </div>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!clientDetail) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F7F7F7" }}
      >
        <p className="text-gray-600">No se encontraron datos para este cliente.</p>
      </div>
    );
  }

  // Map API data to component props
  const files = clientDetail.archivos || [];
  const countryName = clientDetail.country_name;
  const clientName = clientDetail.client_name;

  const clientConfig = {
    periodicity: clientDetail.periodicidad?.[0] || "Daily",
    fileTypes: clientDetail.tipos_archivo_esperados
  };

  const clientInfo = {
    ingestaSource: clientDetail.fuente_ingesta?.[0] || "Email",
    ingestaVariables: parseDetailFuente(clientDetail.detalle_fuente || ""),
    stakeholder: clientDetail.stakeholder?.toString(),
    dailyDetails: { diasHabiles: true, festivos: false },
    weeklyDetails: { acumulado: false, porRango: false }
  };

  // Transform files for display
  const displayFiles = files.map((archivo) => ({
    id: archivo.id.toString(),
    name: archivo.nombre_archivo,
    type: "file",
    size: formatBytes(archivo.tamano),
    lastUpdate: formatDateTime(archivo.fecha_hora),
    status: archivo.estado.toLowerCase(),
    category: archivo.tipo_archivo
  }));

  const filteredFiles = displayFiles.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/data-quality");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F7F7" }}>
      <main>
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "#141414" }}>
            {clientName}
          </h1>
        </div>

        <Card className="" style={{ backgroundColor: "#FFFFFF", borderColor: "#DDDDDD" }}>
          <CardContent>
            <div className="flex items-center justify-between mb-6 ">
              <div className="mb-6 flex items-center gap-4">
                <Button
                  onClick={handleGoBack}
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Atrás
                </Button>

                <h2 className="text-lg font-semibold" style={{ color: "#141414" }}>
                  Información general
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="text-sm font-medium"
                  style={{
                    backgroundColor: "#CBE71E",
                    color: "#141414",
                    border: "none"
                  }}
                >
                  Puntos de venta
                </Button>
                <Button
                  className="text-sm font-medium"
                  style={{
                    backgroundColor: "#CBE71E",
                    color: "#141414",
                    border: "none"
                  }}
                >
                  Catálogos
                </Button>
                {/* Create Ingestion Button */}
                <Button
                  className="ml-auto bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
                  onClick={() => setModalState({ isOpen: true, mode: "create" })}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Crear nueva ingesta
                </Button>

                <Button
                  variant="outline"
                  className="text-sm font-medium bg-transparent"
                  onClick={() => setModalState({ isOpen: true, mode: "edit" })}
                  style={{ borderColor: "#DDDDDD", color: "#141414" }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>

            <ClientDetailInfo clientConfig={clientConfig} clientInfo={clientInfo} />

            <ClientDetailTable files={filteredFiles} />
          </CardContent>
        </Card>

        <div className="mt-4 text-sm" style={{ color: "#141414" }}>
          Mostrando {filteredFiles.length} de {files.length} archivos
        </div>
      </main>

      {modalState.isOpen && clientId && clientDetail && clientName && (
        <ModalDataIntake
          open={modalState.isOpen}
          onOpenChange={() => setModalState({ isOpen: false, mode: "create" })}
          mode={modalState.mode}
          clientId={clientId as string}
          clientName={clientName}
          idCountry={clientDetail.id_country || 1}
          onSuccess={() => {
            // Refresh client data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
