"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { BellSimpleRinging } from "phosphor-react";

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
import Header from "@/components/organisms/header";

import { IClientData } from "@/types/dataQuality/IDataQuality";

export default function CountriesClientsView() {
  const params = useParams();
  const countryId = params.countryId as string;

  const router = useRouter();
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const height = useScreenHeight();

  const handleGoBack = () => {
    router.push("/data-quality");
  };

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodicityFilter, setPeriodicityFilter] = useState("all");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [intakeTypeFilter, setIntakeTypeFilter] = useState("all");
  const [isModalClientOpen, setIsModalClientOpen] = useState(false);

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
      status: statusFilter !== "all" ? statusFilter : undefined,
      periodicity: periodicityFilter !== "all" ? periodicityFilter : undefined,
      id_type_archive: fileTypeFilter !== "all" ? Number(fileTypeFilter) : undefined,
      id_intake_type: intakeTypeFilter !== "all" ? Number(intakeTypeFilter) : undefined,
      search: debouncedSearchTerm || undefined
    }
  );

  const clientsData = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleRowClick = (record: IClientData) => {
    router.push(`/data-quality/client/${record.id}`);
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
            <div className="flex items-center gap-4">
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

              <DataQualityGeneralFilter
                filterOptions={filters}
                selectedStatus={statusFilter}
                onStatusChange={(val) => setStatusFilter(val ?? "all")}
                selectedPeriodicity={periodicityFilter}
                onPeriodicityChange={(val) => setPeriodicityFilter(val ?? "all")}
                selectedFileType={fileTypeFilter}
                onFileTypeChange={(val) => setFileTypeFilter(val ?? "all")}
                selectedIntakeType={intakeTypeFilter}
                onIntakeTypeChange={(val) => setIntakeTypeFilter(val ?? "all")}
              />
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={`/data-quality/alerts?countryId=${countryId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Button variant="outline" className="h-12">
                  <BellSimpleRinging size={18} />
                  <span className="hidden min-[1000px]:inline">Alertas</span>
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
      <ModalCreateEditClient
        isOpen={isModalClientOpen}
        onClose={() => setIsModalClientOpen(false)}
        onSuccess={mutate}
        countryName=""
        countryId={countryId}
        mode="create"
      />
    </div>
  );
}
