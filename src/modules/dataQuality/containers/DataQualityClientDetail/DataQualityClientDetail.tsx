"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Edit, ArrowLeft } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { useDataQualityClientDetail } from "../../hooks/useDataQualityClientDetail";

import Header from "@/components/organisms/header";
import { Button } from "@/modules/chat/ui/button";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { ModalCreateEditClient } from "../../components/ModalCreateEditClient";
import { ClientDetailInfo } from "../../components/ClientDetailInfo";
import { ClientDetailIntakesTable } from "../../components/ClientDetailIntakesTable";
import { ClientDetailTable } from "../../components/ClientDetailTable";
import { BellSimpleRinging } from "@phosphor-icons/react";

export default function DataQualityClientDetails() {
  const params = useParams();
  const router = useRouter();
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);

  const clientId = params.clientId as string;
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);

  // Fetch client detail data using SWR hook
  const { clientDetail, isLoading, error, mutate } = useDataQualityClientDetail(
    clientId,
    projectId
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" style={{ backgroundColor: "#F7F7F7" }}>
        <Header title="" />
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="text-gray-600">Cargando información del cliente...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col gap-4" style={{ backgroundColor: "#F7F7F7" }}>
        <Header title="" />
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <h2 className="text-xl font-semibold">Error al cargar los datos</h2>
            </div>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!clientDetail) {
    return (
      <div className="flex flex-col gap-4" style={{ backgroundColor: "#F7F7F7" }}>
        <Header title="" />
        <div className="min-h-[400px] flex items-center justify-center">
          <p className="text-gray-600">No se encontraron datos para este cliente.</p>
        </div>
      </div>
    );
  }

  // Map API data to component props
  const countryName = clientDetail.country_name;
  const clientName = clientDetail.client_name;

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/data-quality");
    }
  };

  return (
    <div className="flex flex-col gap-4" style={{ backgroundColor: "#F7F7F7" }}>
      <Header title={`${countryName} - ${clientName}` || ""} />
      <main>
        <Card className="border-none">
          <CardContent>
            <div className="flex items-center justify-between mb-6 ">
              <Button
                onClick={handleGoBack}
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Atrás
              </Button>
              <div className="flex items-center gap-3">
                <Link
                  href={`/data-quality/alerts?countryId=${clientDetail.id_country}&clientId=${clientDetail.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Button variant="outline" className="">
                    <BellSimpleRinging size={18} />
                    Alertas
                  </Button>
                </Link>
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
                <Link href={`/data-quality/catalogs/${clientId}/${clientDetail.id_country}`}>
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
                </Link>
                <Button
                  variant="outline"
                  className="text-sm font-medium bg-transparent"
                  onClick={() => setIsEditClientOpen(true)}
                  style={{ borderColor: "#DDDDDD", color: "#141414" }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>

            <ClientDetailInfo
              clientName={clientDetail?.client_name}
              stakeholder={clientDetail?.stakeholder?.toString()}
            />
            <ClientDetailIntakesTable
              clientId={clientId}
              clientName={clientDetail.client_name}
              idCountry={clientDetail.id_country}
              intakes={clientDetail.client_data_archives}
              onSuccess={() => mutate()}
            />

            <ClientDetailTable files={clientDetail.archives_client_data} mutate={() => mutate()} />
          </CardContent>
        </Card>

        <div className="mt-4 text-sm" style={{ color: "#141414" }}>
          Mostrando {clientDetail.archives_client_data.length} de{" "}
          {clientDetail.archives_client_data.length} archivos
        </div>
      </main>

      <ModalCreateEditClient
        isOpen={isEditClientOpen}
        onClose={() => setIsEditClientOpen(false)}
        onSuccess={() => mutate()}
        countryName={countryName || ""}
        countryId={String(clientDetail.id_country || "")}
        mode="edit"
        clientData={{
          id: clientDetail.id!,
          client_name: clientDetail.client_name || "",
          stakeholder: String(clientDetail.stakeholder || "")
        }}
      />
    </div>
  );
}
