"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { message } from "antd";

import {
  downloadUnifiedCatalogFile,
  downloadIqviaAuxCatalog,
  downloadIqviaAuxProductCatalog,
  uploadIqviaAuxCatalog,
  uploadIqviaAuxProductCatalog,
  uploadCatalogMaterial,
  uploadPointsOfSaleFile,
  uploadPacksFile
} from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";
import { checkUserComponentPermission, hasDataQualityManagementPermission } from "@/utils/utils";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import { useDebounce } from "@/hooks/useDeabouce";
import { useCountriesClients } from "../../hooks/useCountriesClients";
import { useDataQualityAlerts } from "../../hooks/useDataQualityAlerts";

import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { AlertsPill } from "../../components/alerts-pill/AlertsPill";
import { Button } from "@/modules/chat/ui/button";
import { ModalCreateEditClient } from "../../components/ModalCreateEditClient";
import CountriesClientsTable from "../../components/countries-clients-table/CountriesClientsTable";
import {
  ClientsFilterModal,
  ClientsFilterValues
} from "../../components/clients-filter-modal/ClientsFilterModal";
import { CountryClientsActionsModal } from "../../components/CountryClientsActionsModal/CountryClientsActionsModal";
import { IqviaUploadResultModal } from "../../components/IqviaUploadResultModal/IqviaUploadResultModal";
import { ModalUploadFile } from "@/components/atoms/ModalUploadFile/ModalUploadFile";
import Header from "@/components/organisms/header";

import { IClientData, IIqviaAuxUploadResult } from "@/types/dataQuality/IDataQuality";
import { TierQuickFilter, useTierFilter } from "../../tiers";

export default function CountriesClientsView() {
  const params = useParams();
  const countryId = params.countryId as string;

  const router = useRouter();
  const selectedProject = useAppStore((projects) => projects.selectedProject);
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const canManage = hasDataQualityManagementPermission(selectedProject);
  const canDownloadCatalog = checkUserComponentPermission(
    selectedProject,
    "DataQuality",
    "data-download-catalog"
  );
  const height = useScreenHeight();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [activeFilters, setActiveFilters] = useState<ClientsFilterValues>({
    status: null,
    periodicity: null,
    fileType: null,
    intakeType: null
  });
  const [whichModalIsOpen, setWhichModalIsOpen] = useState(0);
  const closeAllModals = () => setWhichModalIsOpen(0);
  const [isDownloadCatalogLoading, setIsDownloadCatalogLoading] = useState(false);
  const [isDownloadIqviaLoading, setIsDownloadIqviaLoading] = useState(false);
  const [isDownloadIqviaProductLoading, setIsDownloadIqviaProductLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isUploadIqviaLoading, setIsUploadIqviaLoading] = useState(false);
  const [isUploadIqviaProductLoading, setIsUploadIqviaProductLoading] = useState(false);
  const [isUploadPacksLoading, setIsUploadPacksLoading] = useState(false);
  const [iqviaUploadResult, setIqviaUploadResult] = useState<IIqviaAuxUploadResult | null>(null);
  const [iqviaProductUploadResult, setIqviaProductUploadResult] =
    useState<IIqviaAuxUploadResult | null>(null);

  // El auxiliar IQVIA solo aplica a Brasil (id_country = 9).
  const isBrazil = String(countryId) === "9";

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  const selectedTiers = useTierFilter((s) => s.selected);
  const tiersKey = selectedTiers.join(",");
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [tiersKey]);

  const { data, filters, isLoading, error, mutate } = useCountriesClients(
    countryId,
    projectId,
    pagination.current,
    pagination.pageSize,
    {
      status: activeFilters.status ?? undefined,
      periodicity: activeFilters.periodicity ?? undefined,
      id_type_archive: activeFilters.fileType ? Number(activeFilters.fileType) : undefined,
      id_intake_type: activeFilters.intakeType ? Number(activeFilters.intakeType) : undefined,
      search: debouncedSearchTerm || undefined,
      tiers: selectedTiers
    }
  );

  // Only the total is needed for the alerts pill next to the title.
  const { data: alertsSummary } = useDataQualityAlerts(
    1,
    1,
    undefined,
    Number(countryId),
    undefined,
    undefined,
    selectedTiers
  );

  const clientsData = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleRowClick = (record: IClientData) => {
    router.push(`/data-quality/client/${record.id}`);
  };

  const handleDownloadCatalog = async () => {
    setIsDownloadCatalogLoading(true);

    const hide = message.open({
      type: "loading",
      content: "Descargando catálogo...",
      duration: 0
    });

    try {
      const res = await downloadUnifiedCatalogFile({
        countryId
      });
      window.open(res.url, "_blank");

      message.success("Catálogo descargado exitosamente.");
      closeAllModals();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al descargar el catálogo");
    } finally {
      hide();
      setIsDownloadCatalogLoading(false);
    }
  };

  const handleDownloadIqviaCatalog = async () => {
    setIsDownloadIqviaLoading(true);

    const hide = message.open({
      type: "loading",
      content: "Descargando catálogo IQVIA...",
      duration: 0
    });

    try {
      const res = await downloadIqviaAuxCatalog({ countryId });
      window.open(res.url, "_blank");

      message.success("Catálogo IQVIA descargado exitosamente.");
      closeAllModals();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al descargar el catálogo IQVIA"
      );
    } finally {
      hide();
      setIsDownloadIqviaLoading(false);
    }
  };

  const handleOpenIqviaUpload = () => {
    setWhichModalIsOpen(6);
  };

  const handleUploadIqviaCatalog = async (file: File) => {
    setIsUploadIqviaLoading(true);
    try {
      const res = await uploadIqviaAuxCatalog(file, countryId);
      setIqviaUploadResult(res);
      closeAllModals();

      if (res.errores.length > 0) {
        message.warning(
          `Carga procesada con ${res.errores.length} error(es). ` +
            `Insertados: ${res.insertados}, actualizados: ${res.actualizados}, ` +
            `sin cambios: ${res.sin_cambios}.`
        );
      } else {
        message.success(
          `Carga completa. Insertados: ${res.insertados}, actualizados: ${res.actualizados}, ` +
            `sin cambios: ${res.sin_cambios}.`
        );
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al cargar el catálogo IQVIA");
    } finally {
      setIsUploadIqviaLoading(false);
    }
  };

  const handleDownloadIqviaProductCatalog = async () => {
    setIsDownloadIqviaProductLoading(true);

    const hide = message.open({
      type: "loading",
      content: "Descargando catálogo IQVIA Productos...",
      duration: 0
    });

    try {
      const res = await downloadIqviaAuxProductCatalog({ countryId });
      window.open(res.url, "_blank");

      message.success("Catálogo IQVIA Productos descargado exitosamente.");
      closeAllModals();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al descargar el catálogo IQVIA Productos"
      );
    } finally {
      hide();
      setIsDownloadIqviaProductLoading(false);
    }
  };

  const handleOpenIqviaProductUpload = () => {
    setWhichModalIsOpen(7);
  };

  const handleUploadIqviaProductCatalog = async (file: File) => {
    setIsUploadIqviaProductLoading(true);
    try {
      const res = await uploadIqviaAuxProductCatalog(file, countryId);
      setIqviaProductUploadResult(res);
      closeAllModals();

      if (res.errores.length > 0) {
        message.warning(
          `Carga procesada con ${res.errores.length} error(es). ` +
            `Insertados: ${res.insertados}, actualizados: ${res.actualizados}, ` +
            `sin cambios: ${res.sin_cambios}.`
        );
      } else {
        message.success(
          `Carga completa. Insertados: ${res.insertados}, actualizados: ${res.actualizados}, ` +
            `sin cambios: ${res.sin_cambios}.`
        );
      }
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al cargar el catálogo IQVIA Productos"
      );
    } finally {
      setIsUploadIqviaProductLoading(false);
    }
  };

  const handleOpenAuxiliaryUpload = () => {
    setWhichModalIsOpen(2);
  };

  const handleUploadMaterialsAuxiliary = async (file: File) => {
    setIsUploadLoading(true);
    try {
      await uploadCatalogMaterial(file);
      message.success("Archivo de auxiliar de materiales cargado exitosamente.");
      closeAllModals();
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

  const handleOpenPointsOfSaleUpload = () => {
    setWhichModalIsOpen(4);
  };

  const handleUploadPointsOfSale = async (file: File) => {
    setIsUploadLoading(true);
    try {
      await uploadPointsOfSaleFile(file);
      message.success("Archivo de puntos de venta cargado exitosamente.");
      closeAllModals();
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
    setWhichModalIsOpen(5);
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
      closeAllModals();
      mutate();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al cargar el archivo de packs."
      );
    } finally {
      setIsUploadPacksLoading(false);
    }
  };

  const countryName = clientsData.length > 0 ? clientsData[0].country_name : "";

  return (
    <div className="cp-page">
      <Header
        title={countryName}
        back="/data-quality"
        titleExtra={
          checkUserComponentPermission(selectedProject, "DataQuality", "data-view-alerts") ? (
            <AlertsPill
              href={`/data-quality/alerts?countryId=${countryId}`}
              count={(alertsSummary as unknown as { total?: number } | undefined)?.total}
            />
          ) : undefined
        }
        actionsExtra={
          <>
            <ClientsFilterModal
              options={filters}
              value={activeFilters}
              onChange={(next) => {
                setActiveFilters(next);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
            />
            <HeaderSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar cliente"
            />
          </>
        }
      />

      {/* Main Content */}
      <div className="cp-card px-[18px] py-[14px]">
        {/* Title line: tier legend on the left, module actions on the right (36px) */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="whitespace-nowrap text-[18px] font-semibold text-[#141414]">
              Clientes
            </span>
            <TierQuickFilter options={filters?.tiers} />
          </div>

          <div className="flex items-center gap-2">
            {(canManage || canDownloadCatalog) && (
              <GenerateActionButton onClick={() => setWhichModalIsOpen(1)} />
            )}
            {hasDataQualityManagementPermission(selectedProject) && (
              <Link
                href={`/data-quality/references?scope=country&id_country=${countryId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Button
                  variant="ghost"
                  className="h-[var(--control-h)] border-0 bg-[#f7f7f7] font-semibold text-[#141414] hover:bg-[#efefef]"
                >
                  Referencias
                </Button>
              </Link>
            )}
            {canManage && (
              <Button
                className="h-[var(--control-h)] bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
                onClick={() => setWhichModalIsOpen(3)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear cliente
              </Button>
            )}
          </div>
        </div>

        {/* Clients Table */}
        {error ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-red-600">
              {error instanceof Error
                ? error.message
                : "No se pudo cargar la información de este país."}
            </p>
          </div>
        ) : (
          <CountriesClientsTable
            data={clientsData}
            loading={isLoading}
            pagination={{ ...pagination, total }}
            onPaginationChange={(page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize
              }));
            }}
            scrollHeight={height - 325}
            onRowClick={handleRowClick}
          />
        )}
      </div>
      <CountryClientsActionsModal
        isOpen={whichModalIsOpen === 1}
        onClose={closeAllModals}
        onDownloadCatalog={handleDownloadCatalog}
        isDownloadCatalogLoading={isDownloadCatalogLoading}
        onDownloadIqviaCatalog={isBrazil ? handleDownloadIqviaCatalog : undefined}
        isDownloadIqviaCatalogLoading={isDownloadIqviaLoading}
        onUploadIqviaCatalog={isBrazil ? handleOpenIqviaUpload : undefined}
        onDownloadIqviaProductCatalog={isBrazil ? handleDownloadIqviaProductCatalog : undefined}
        isDownloadIqviaProductCatalogLoading={isDownloadIqviaProductLoading}
        onUploadIqviaProductCatalog={isBrazil ? handleOpenIqviaProductUpload : undefined}
        onUploadMaterialsAuxiliary={handleOpenAuxiliaryUpload}
        onUploadPointsOfSale={handleOpenPointsOfSaleUpload}
        onUploadPacks={handleOpenPacksUpload}
        downloadCatalogOnly={!canManage}
      />
      <ModalUploadFile
        isOpen={whichModalIsOpen === 2}
        onClose={closeAllModals}
        onFileUpload={handleUploadMaterialsAuxiliary}
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
      <ModalCreateEditClient
        isOpen={whichModalIsOpen === 3}
        onClose={closeAllModals}
        onSuccess={mutate}
        countryName=""
        countryId={countryId}
        mode="create"
      />
      <ModalUploadFile
        isOpen={whichModalIsOpen === 4}
        onClose={closeAllModals}
        onFileUpload={handleUploadPointsOfSale}
        loading={isUploadLoading}
        allowedExtensions={[".xls", ".xlsx", ".csv"]}
      />
      <ModalUploadFile
        isOpen={whichModalIsOpen === 5}
        onClose={closeAllModals}
        onFileUpload={handleUploadPacks}
        loading={isUploadPacksLoading}
        allowedExtensions={[".xls", ".xlsx"]}
      />
      <ModalUploadFile
        isOpen={whichModalIsOpen === 6}
        onClose={closeAllModals}
        onFileUpload={handleUploadIqviaCatalog}
        loading={isUploadIqviaLoading}
        allowedExtensions={[".xlsx"]}
        title="Cargar catálogo IQVIA Clientes"
      />
      <ModalUploadFile
        isOpen={whichModalIsOpen === 7}
        onClose={closeAllModals}
        onFileUpload={handleUploadIqviaProductCatalog}
        loading={isUploadIqviaProductLoading}
        allowedExtensions={[".xlsx"]}
        title="Cargar catálogo IQVIA Productos"
      />

      <IqviaUploadResultModal
        title="Resultado de carga IQVIA Clientes"
        result={iqviaUploadResult}
        onClose={() => setIqviaUploadResult(null)}
      />
      <IqviaUploadResultModal
        title="Resultado de carga IQVIA Productos"
        result={iqviaProductUploadResult}
        onClose={() => setIqviaProductUploadResult(null)}
      />
    </div>
  );
}
