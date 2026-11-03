"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BellSimpleRinging } from "phosphor-react";
import { DotsThree } from "phosphor-react";
import { Button as AntButton, message } from "antd";

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

import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";
import { ModalCreateEditClient } from "../../components/ModalCreateEditClient";
import CountriesClientsTable from "../../components/countries-clients-table/CountriesClientsTable";
import { DataQualityGeneralFilter } from "../../components/general-filter";
import { CountryClientsActionsModal } from "../../components/CountryClientsActionsModal/CountryClientsActionsModal";
import { IqviaUploadResultModal } from "../../components/IqviaUploadResultModal/IqviaUploadResultModal";
import { ModalUploadFile } from "@/components/atoms/ModalUploadFile/ModalUploadFile";
import Header from "@/components/organisms/header";

import { IClientData, IIqviaAuxUploadResult } from "@/types/dataQuality/IDataQuality";
import useScreenWidth from "@/components/hooks/useScreenWidth";

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
  const width = useScreenWidth();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [activeFilters, setActiveFilters] = useState({
    status: "all",
    periodicity: "all",
    fileType: "all",
    intakeType: "all"
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

  const { data, filters, isLoading, error, mutate } = useCountriesClients(
    countryId,
    projectId,
    pagination.current,
    pagination.pageSize,
    {
      status: activeFilters.status !== "all" ? activeFilters.status : undefined,
      periodicity: activeFilters.periodicity !== "all" ? activeFilters.periodicity : undefined,
      id_type_archive:
        activeFilters.fileType !== "all" ? Number(activeFilters.fileType) : undefined,
      id_intake_type:
        activeFilters.intakeType !== "all" ? Number(activeFilters.intakeType) : undefined,
      search: debouncedSearchTerm || undefined
    }
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
      <Header title={countryName} back="/data-quality" />

      {/* Main Content */}
      <div className="cp-card px-[18px] py-[14px]">
        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="flex-1 max-w-sm">
              <UiSearchInput
                placeholder="Buscar cliente..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <AntButton
              className="flex items-center gap-2 px-4 !h-[var(--control-h)] !bg-[#f7f7f7] !border-none rounded-lg !font-semibold !text-sm cursor-pointer hover:!border-[#dddddd]"
              size="large"
              icon={<DotsThree size={18} weight="bold" />}
              style={{ display: canManage || canDownloadCatalog ? undefined : "none" }}
              onClick={() => setWhichModalIsOpen(1)}
            >
              {width > 1100 && <span className="hidden min-[1100px]:inline">Generar acción</span>}
            </AntButton>

            <DataQualityGeneralFilter
              filterOptions={filters}
              activeFilters={activeFilters}
              onChange={(key, val) =>
                setActiveFilters((prev) => ({ ...prev, [key]: val ?? "all" }))
              }
            />
          </div>

          <div className="flex items-center gap-4">
            {checkUserComponentPermission(selectedProject, "DataQuality", "data-view-alerts") && (
              <Link
                href={`/data-quality/alerts?countryId=${countryId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Button variant="outline" className="h-[var(--control-h)]">
                  <BellSimpleRinging size={18} />
                  <span className="hidden min-[1100px]:inline">Alertas</span>
                </Button>
              </Link>
            )}
            {hasDataQualityManagementPermission(selectedProject) && (
              <Link
                href={`/data-quality/references?scope=country&id_country=${countryId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Button variant="outline" className="h-[var(--control-h)]">
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
