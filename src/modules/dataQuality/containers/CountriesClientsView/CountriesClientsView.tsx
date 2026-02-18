"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { BellSimpleRinging } from "phosphor-react";
import { DotsThree } from "phosphor-react";
import { Button as AntButton, message } from "antd";

import { downloadCatalogFile, getClientData } from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";
import useScreenHeight from "@/components/hooks/useScreenHeight";

import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { ModalCreateEditClient } from "../../components/ModalCreateEditClient";
import CountriesClientsTable from "../../components/countries-clients-table/CountriesClientsTable";
import { DataQualityGeneralFilter } from "../../components/general-filter";
import { CountryClientsActionsModal } from "../../components/CountryClientsActionsModal/CountryClientsActionsModal";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodicityFilter, setPeriodicityFilter] = useState("all");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [isModalClientOpen, setIsModalClientOpen] = useState(false);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [isDownloadCatalogLoading, setIsDownloadCatalogLoading] = useState(false);

  // API data state
  const [clientsData, setClientsData] = useState<IClientData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getClientData(
        countryId,
        projectId,
        pagination.pageSize,
        pagination.current
      );
      setClientsData(res.data);
      setPagination((prev) => ({
        ...prev,
        total: res.total
      }));
    } catch (err) {
      console.error("Error fetching client data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, pagination.current, pagination.pageSize]);

  // Filter by client_name only (other filters remain mock)
  const filteredData = clientsData.filter((client) =>
    client.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (record: IClientData) => {
    router.push(`/data-quality/client/${record.id}`);
  };

  const handleDownloadCatalog = async () => {
    setIsDownloadCatalogLoading(true);
    try {
      const res = await downloadCatalogFile({
        countryId
      });
      const url = window.URL.createObjectURL(new Blob([res.url]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${res.filename}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsActionsModalOpen(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al descargar el catálogo");
    }
    setIsDownloadCatalogLoading(false);
  };

  const countryName = clientsData.length > 0 ? clientsData[0].country_name : "";

  return (
    <div className="flex flex-col gap-4">
      <Header title={countryName} />
      {/* <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-bold text-[#141414]">{countryName}</h1>
      </div> */}

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
                onClick={() => setIsActionsModalOpen(true)}
              >
                {width > 1100 && <span className="hidden min-[1100px]:inline">Generar acción</span>}
              </AntButton>

              <DataQualityGeneralFilter
                selectedStatus={statusFilter}
                onStatusChange={(val) => setStatusFilter(val ?? "all")}
                selectedPeriodicity={periodicityFilter}
                onPeriodicityChange={(val) => setPeriodicityFilter(val ?? "all")}
                selectedFileType={fileTypeFilter}
                onFileTypeChange={(val) => setFileTypeFilter(val ?? "all")}
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
                onClick={() => setIsModalClientOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear cliente
              </Button>
            </div>
          </div>

          {/* Clients Table */}
          <CountriesClientsTable
            data={filteredData}
            loading={loading}
            pagination={pagination}
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
        isOpen={isActionsModalOpen}
        onClose={() => setIsActionsModalOpen(false)}
        onDownloadCatalog={handleDownloadCatalog}
        isDownloadCatalogLoading={isDownloadCatalogLoading}
      />
      <ModalCreateEditClient
        isOpen={isModalClientOpen}
        onClose={() => setIsModalClientOpen(false)}
        onSuccess={fetchData}
        countryName=""
        countryId={countryId}
        mode="create"
      />
    </div>
  );
}
