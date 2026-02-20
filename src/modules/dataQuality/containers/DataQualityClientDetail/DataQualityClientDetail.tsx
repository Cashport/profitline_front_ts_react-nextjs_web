"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { message } from "antd";
import { ArrowLeft } from "lucide-react";
import { BellSimpleRinging } from "@phosphor-icons/react";
import { DotsThree } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { useDataQualityClientDetail } from "../../hooks/useDataQualityClientDetail";
import {
  downloadCatalogFile,
  uploadCatalogMaterial,
  uploadMassiveOrHistoricalFile
} from "@/services/dataQuality/dataQuality";

import Header from "@/components/organisms/header";
import { Button } from "@/modules/chat/ui/button";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { ModalCreateEditClient } from "../../components/ModalCreateEditClient";
import { ClientDetailInfo } from "../../components/ClientDetailInfo";
import { ClientDetailIntakesTable } from "../../components/ClientDetailIntakesTable";
import { ClientDetailTable } from "../../components/ClientDetailTable";
import { ModalUploadFile } from "@/components/atoms/ModalUploadFile/ModalUploadFile";
import { CountryClientsActionsModal } from "../../components/CountryClientsActionsModal/CountryClientsActionsModal";

import { IUploadMassiveOrHistoricalRequest } from "@/types/dataQuality/IDataQuality";

export default function DataQualityClientDetails() {
  const params = useParams();
  const router = useRouter();
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);

  const clientId = params.clientId as string;
  const [isDownloadCatalogLoading, setIsDownloadCatalogLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [whichModalIsOpen, setWhichModalIsOpen] = useState(0);
  const [uploadType, setUploadType] = useState<"massive" | "auxiliary">("massive");

  // Fetch client detail data using SWR hook
  const { clientDetail, isLoading, error, mutate } = useDataQualityClientDetail(
    clientId,
    projectId
  );

  const handleDownloadCatalog = async () => {
    setIsDownloadCatalogLoading(true);

    const hide = message.open({
      type: "loading",
      content: "Descargando catálogo...",
      duration: 0
    });

    try {
      const res = await downloadCatalogFile({ clientId });

      const link = document.createElement("a");
      link.href = res.url;
      link.setAttribute("download", res.filename || "catalogo.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success("Catálogo descargado exitosamente.");
      setWhichModalIsOpen(0);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Error al descargar el catálogo.";

      message.error(errorMessage);
    } finally {
      hide();
      setIsDownloadCatalogLoading(false);
    }
  };

  const handleOpenMassiveUpload = () => {
    setUploadType("massive");
    setWhichModalIsOpen(3);
  };

  const handleOpenAuxiliaryUpload = () => {
    setUploadType("auxiliary");
    setWhichModalIsOpen(3);
  };

  const handleUploadMassive = async (file: File) => {
    setIsUploadLoading(true);
    const requestObject: IUploadMassiveOrHistoricalRequest = {
      id_client: Number(clientId),
      id_country: Number(clientDetail?.id_country),
      id_type_archive: 1,
      data_type: ""
    };
    try {
      await uploadMassiveOrHistoricalFile({ file, requestObject });
      message.success("Archivo cargado exitosamente.");
      setWhichModalIsOpen(0);
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al cargar el archivo.");
    } finally {
      setIsUploadLoading(false);
    }
  };

  const handleUploadMaterialsAuxiliary = async (file: File) => {
    setIsUploadLoading(true);
    try {
      // Implement the upload logic here, similar to handleUploadMassive
      await uploadCatalogMaterial(file);
      message.success("Archivo de auxiliar de materiales cargado exitosamente.");
      setWhichModalIsOpen(0);
      mutate();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Error al cargar el archivo de auxiliar de materiales."
      );
    } finally {
      setIsUploadLoading(false);
    }
  };

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
                <Button variant="outline" className="" onClick={() => setWhichModalIsOpen(2)}>
                  <DotsThree size={"1.5rem"} />
                  Generar acción
                </Button>
                <Link
                  href={`/data-quality/alerts?countryId=${clientDetail.id_country}&clientId=${clientDetail.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Button variant="outline" className="">
                    <BellSimpleRinging size={18} />
                    Alertas
                  </Button>
                </Link>

                <Link
                  href={`/data-quality/catalogs/${clientId}/${clientDetail.id_country}?clientName=${clientDetail.client_name}&countryName=${clientDetail.country_name}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
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
              </div>
            </div>

            <ClientDetailInfo
              clientName={clientDetail?.client_name}
              stakeholder={clientDetail?.stakeholder?.toString()}
              setIsEditClientOpen={(isOpen) => setWhichModalIsOpen(isOpen ? 1 : 0)}
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
        isOpen={whichModalIsOpen === 1}
        onClose={() => setWhichModalIsOpen(0)}
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

      <CountryClientsActionsModal
        isOpen={whichModalIsOpen === 2}
        isInDetailView
        onClose={() => setWhichModalIsOpen(0)}
        onDownloadCatalog={handleDownloadCatalog}
        isDownloadCatalogLoading={isDownloadCatalogLoading}
        onUploadFile={handleOpenMassiveUpload}
        onUploadMaterialsAuxiliary={handleOpenAuxiliaryUpload}
      />

      <ModalUploadFile
        isOpen={whichModalIsOpen === 3}
        onClose={() => setWhichModalIsOpen(0)}
        onFileUpload={
          uploadType === "massive" ? handleUploadMassive : handleUploadMaterialsAuxiliary
        }
        loading={isUploadLoading}
        allowedExtensions={[
          ".pdf",
          ".jpg",
          ".jpeg",
          ".png",
          ".xls",
          ".xlsx",
          ".csv",
          ".txt",
          ".eml",
          ".msg"
        ]}
      />
    </div>
  );
}
