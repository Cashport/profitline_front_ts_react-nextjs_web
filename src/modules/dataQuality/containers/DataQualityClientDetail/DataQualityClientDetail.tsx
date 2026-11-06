"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { message } from "antd";
import { DotsThree } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { checkUserComponentPermission, hasDataQualityManagementPermission } from "@/utils/utils";
import { useDataQualityClientDetail } from "../../hooks/useDataQualityClientDetail";
import {
  downloadUnifiedCatalogFile,
  uploadCatalogMaterial,
  uploadMassiveOrHistoricalFile,
  uploadPointsOfSaleFile,
  uploadPacksFile
} from "@/services/dataQuality/dataQuality";

import Header from "@/components/organisms/header";
import { Button } from "@/modules/chat/ui/button";
import { ModalCreateEditClient } from "../../components/ModalCreateEditClient";
import { ClientDetailInfo } from "../../components/ClientDetailInfo";
import { ClientDetailArchives } from "../../components/ClientDetailArchives";
import type { ClientArchiveAction } from "../../components/ClientDetailArchives/client-detail-archives";
import { ClientMonthMatrix } from "../../components/client-month-matrix/ClientMonthMatrix";
import { ModalUploadFile } from "@/components/atoms/ModalUploadFile/ModalUploadFile";
import { CountryClientsActionsModal } from "../../components/CountryClientsActionsModal/CountryClientsActionsModal";
import ModalUploadInTransitHaleon from "../../components/ModalUploadInTransitHaleon/ModalUploadInTransitHaleon";

import { IUploadMassiveOrHistoricalRequest } from "@/types/dataQuality/IDataQuality";
import { ModalDataEmailRules } from "../../components/ModalDataRegisteredEmails/ModalDataEmailRules";
import { TierBadge } from "../../tiers";
import { AlertsPill } from "../../components/alerts-pill/AlertsPill";

/** White, borderless header button on the gray page (same as the Data Quality home). */
const HEADER_BTN =
  "flex h-[var(--control-h)] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-white px-3.5 text-[13px] font-medium text-[#141414] no-underline transition-colors hover:bg-[#f2f2f2] hover:text-[#141414]";

export default function DataQualityClientDetails() {
  const params = useParams();
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const selectedProject = useAppStore((projects) => projects.selectedProject);
  const canManage = hasDataQualityManagementPermission(selectedProject);
  const canDownloadCatalog = checkUserComponentPermission(
    selectedProject,
    "DataQuality",
    "data-download-catalog"
  );

  const clientId = params.clientId as string;
  const [isDownloadCatalogLoading, setIsDownloadCatalogLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isUploadPacksLoading, setIsUploadPacksLoading] = useState(false);
  const [whichModalIsOpen, setWhichModalIsOpen] = useState(0);
  const [uploadType, setUploadType] = useState<"massive" | "auxiliary">("massive");
  const [archiveCounts, setArchiveCounts] = useState({ shown: 0, total: 0 });
  const [archiveAction, setArchiveAction] = useState<ClientArchiveAction | null>(null);
  const openArchiveAction = (action: ClientArchiveAction) => {
    setWhichModalIsOpen(0);
    setArchiveAction(action);
  };

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
      const res = await downloadUnifiedCatalogFile({ clientId });

      window.open(res.url, "_blank");

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

  const handleOpenPointsOfSaleUpload = () => {
    setWhichModalIsOpen(5);
  };

  const handleUploadPointsOfSale = async (file: File) => {
    setIsUploadLoading(true);
    try {
      await uploadPointsOfSaleFile(file);
      message.success("Archivo de puntos de venta cargado exitosamente.");
      setWhichModalIsOpen(0);
      mutate();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al cargar el archivo de puntos de venta."
      );
    } finally {
      setIsUploadLoading(false);
    }
  };

  const handleOpenPacksUpload = () => {
    setWhichModalIsOpen(6);
  };

  const handleUploadPacks = async (file: File) => {
    setIsUploadPacksLoading(true);
    try {
      const res = await uploadPacksFile(file);
      const summary = `Packs procesados: ${res.total} (creados: ${res.created}, actualizados: ${res.updated}, errores: ${res.errors})`;
      if (res.error_log?.url) {
        message.warning(`${summary}. Se generó un log de errores.`);
        window.open(res.error_log.url, "_blank");
      } else {
        message.success(summary);
      }
      setWhichModalIsOpen(0);
      mutate();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al cargar el archivo de packs."
      );
    } finally {
      setIsUploadPacksLoading(false);
    }
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
      <div className="cp-page">
        <Header title="" back="/data-quality" />
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
      <div className="cp-page">
        <Header title="" back="/data-quality" />
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
      <div className="cp-page">
        <Header title="" back="/data-quality" />
        <div className="min-h-[400px] flex items-center justify-center">
          <p className="text-gray-600">No se encontraron datos para este cliente.</p>
        </div>
      </div>
    );
  }

  // Map API data to component props
  const countryName = clientDetail.country_name;
  const clientName = clientDetail.client_name;

  return (
    <div className="cp-page">
      <Header
        title={`${countryName} - ${clientName}` || ""}
        titleExtra={
          <span className="flex items-center gap-2.5">
            {clientDetail.tier && <TierBadge tier={clientDetail.tier} />}
            {checkUserComponentPermission(selectedProject, "DataQuality", "data-view-alerts") && (
              <AlertsPill
                href={`/data-quality/alerts?countryId=${clientDetail.id_country}&clientId=${clientDetail.id}`}
              />
            )}
          </span>
        }
        back="/data-quality"
        actionsExtra={
          <>
            {(canManage || canDownloadCatalog) && (
              <button type="button" className={HEADER_BTN} onClick={() => setWhichModalIsOpen(2)}>
                <DotsThree size={18} weight="bold" />
                Generar acción
              </button>
            )}
            {hasDataQualityManagementPermission(selectedProject) && (
              <Link
                href={`/data-quality/references?scope=client&id_client=${clientDetail.id}`}
                className={HEADER_BTN}
              >
                Referencias
              </Link>
            )}

            {checkUserComponentPermission(selectedProject, "DataQuality", "data-readonly") && (
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
            )}
          </>
        }
      />
      <div className="cp-card px-[18px] py-[14px]">
        <ClientDetailInfo
          clientName={clientDetail?.client_name}
          stakeholder={clientDetail?.stakeholder?.toString()}
          tier={clientDetail.tier}
          setIsEditClientOpen={(isOpen) => setWhichModalIsOpen(isOpen ? 1 : 0)}
          showEditButton={canManage}
        />
      </div>

      <ClientMonthMatrix
        clientId={Number(clientId)}
        countryId={clientDetail.id_country}
        intakes={clientDetail.client_data_archives}
      />

      <div className="cp-card px-[18px] py-[14px]">
        <ClientDetailArchives
          requestedAction={archiveAction}
          onActionHandled={() => setArchiveAction(null)}
          clientId={clientId}
          clientName={clientName}
          clientNIT={clientDetail.id_client}
          idCountry={clientDetail.id_country}
          intakes={clientDetail.client_data_archives}
          onMutateDetail={() => mutate()}
          onCountsChange={setArchiveCounts}
        />
        <p className="mt-3 text-right text-[13px] text-[#8a8a8a]">
          Mostrando {archiveCounts.shown} de {archiveCounts.total} archivos
        </p>
      </div>

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
          stakeholder: String(clientDetail.stakeholder || ""),
          tier: clientDetail.tier?.code ?? null
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
        onUploadPointsOfSale={handleOpenPointsOfSaleUpload}
        onUploadPacks={handleOpenPacksUpload}
        onUploadInTransitHaleon={() => setWhichModalIsOpen(7)}
        onCreateIntake={canManage ? () => openArchiveAction("createIntake") : undefined}
        onCreateFile={canManage ? () => openArchiveAction("createFile") : undefined}
        onReprocessDates={canManage ? () => openArchiveAction("reprocessDates") : undefined}
        onAddEmails={() => setWhichModalIsOpen(4)}
        downloadCatalogOnly={!canManage}
      />

      <ModalDataEmailRules
        isOpen={whichModalIsOpen === 4}
        onClose={() => setWhichModalIsOpen(0)}
        clientId={Number(clientId)}
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

      <ModalUploadFile
        isOpen={whichModalIsOpen === 5}
        onClose={() => setWhichModalIsOpen(0)}
        onFileUpload={handleUploadPointsOfSale}
        loading={isUploadLoading}
        allowedExtensions={[".xls", ".xlsx", ".csv"]}
      />

      <ModalUploadFile
        isOpen={whichModalIsOpen === 6}
        onClose={() => setWhichModalIsOpen(0)}
        onFileUpload={handleUploadPacks}
        loading={isUploadPacksLoading}
        allowedExtensions={[".xls", ".xlsx"]}
      />

      <ModalUploadInTransitHaleon
        isOpen={whichModalIsOpen === 7}
        onClose={() => setWhichModalIsOpen(0)}
        clientId={clientId}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
