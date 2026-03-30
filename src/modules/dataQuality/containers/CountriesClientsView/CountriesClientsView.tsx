"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { BellSimpleRinging } from "phosphor-react";
import { DotsThree } from "phosphor-react";
import { Button as AntButton, message } from "antd";

import {
  downloadCatalogFile,
  downloadPointsOfSaleFile,
  uploadCatalogMaterial,
  uploadPointsOfSaleFile
} from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import { useDebounce } from "@/hooks/useDeabouce";
import { useCountriesClients } from "../../hooks/useCountriesClients";

import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { ModalCreateEditClient } from "../../components/ModalCreateEditClient";
import CountriesClientsTable from "../../components/countries-clients-table/CountriesClientsTable";
import { DataQualityGeneralFilter } from "../../components/general-filter";
import { CountryClientsActionsModal } from "../../components/CountryClientsActionsModal/CountryClientsActionsModal";
import { ModalUploadFile } from "@/components/atoms/ModalUploadFile/ModalUploadFile";
import Header from "@/components/organisms/header";

import { IClientData } from "@/types/dataQuality/IDataQuality";
import useScreenWidth from "@/components/hooks/useScreenWidth";

export default function CountriesClientsView() {
  const params = useParams();
  const countryId = params.countryId as string;

  const router = useRouter();
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const height = useScreenHeight();
  const width = useScreenWidth();

  const handleGoBack = () => {
    router.push("/data-quality");
  };

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
  const [isDownloadPointsOfSaleLoading, setIsDownloadPointsOfSaleLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  const { data, filters, isLoading, mutate } = useCountriesClients(
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
      const res = await downloadCatalogFile({
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

  const handleDownloadPointsOfSale = async () => {
    setIsDownloadPointsOfSaleLoading(true);

    const hide = message.open({
      type: "loading",
      content: "Descargando puntos de venta...",
      duration: 0
    });

    try {
      const res = await downloadPointsOfSaleFile({
        countryId
      });
      window.open(res.url, "_blank");

      message.success("Puntos de venta descargados exitosamente.");
      closeAllModals();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al descargar los puntos de venta"
      );
    } finally {
      hide();
      setIsDownloadPointsOfSaleLoading(false);
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

  const countryName = clientsData.length > 0 ? clientsData[0].country_name : "";

  return (
    <div className="flex flex-col gap-4">
      <Header title={countryName} />

      {/* Main Content */}
      <Card className="border-none p-0">
        <CardContent className="p-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden min-[900px]:inline">Inicio</span>
              </Button>
              {/* Search Input */}
              <div className="flex-1 max-w-sm">
                <UiSearchInput
                  placeholder="Buscar cliente..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <AntButton
                className="flex items-center gap-2 px-4 !h-[48px] !bg-[#f7f7f7] !border-none rounded-lg !font-semibold text-base cursor-pointer hover:!border-[#dddddd]"
                size="large"
                icon={<DotsThree size={"1.5rem"} />}
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
              <Link
                href={`/data-quality/alerts?countryId=${countryId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Button variant="outline" className="h-12">
                  <BellSimpleRinging size={18} />
                  <span className="hidden min-[1100px]:inline">Alertas</span>
                </Button>
              </Link>
              <Button
                className="h-12 bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
                onClick={() => setWhichModalIsOpen(3)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear cliente
              </Button>
            </div>
          </div>

          {/* Clients Table */}
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
        </CardContent>
      </Card>
      <CountryClientsActionsModal
        isOpen={whichModalIsOpen === 1}
        onClose={closeAllModals}
        onDownloadCatalog={handleDownloadCatalog}
        isDownloadCatalogLoading={isDownloadCatalogLoading}
        onDownloadPointsOfSale={handleDownloadPointsOfSale}
        isDownloadPointsOfSaleLoading={isDownloadPointsOfSaleLoading}
        onUploadMaterialsAuxiliary={handleOpenAuxiliaryUpload}
        onUploadPointsOfSale={handleOpenPointsOfSaleUpload}
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
    </div>
  );
}
