"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, FileText, Filter, ArrowLeft, Plus } from "lucide-react";
import { BellSimpleRinging } from "phosphor-react";

import { getClientData } from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";
import useScreenHeight from "@/components/hooks/useScreenHeight";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { ModalCreateEditClient } from "../../components/ModalCreateEditClient";
import CountriesClientsTable from "../../components/countries-clients-table/CountriesClientsTable";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodicityFilter, setPeriodicityFilter] = useState("all");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [isModalClientOpen, setIsModalClientOpen] = useState(false);

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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Inicio
              </Button>
              {/* Search Input */}
              <div className="flex-1 max-w-sm">
                <UiSearchInput
                  placeholder="Buscar cliente..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px] border-[#DDDDDD]" style={{ height: "48px" }}>
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <Filter className="w-4 h-4 shrink-0" />
                    <SelectValue placeholder="Estados" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="processed">Procesado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="with-alert">Con novedad</SelectItem>
                  <SelectItem value="partial">Procesado parcial</SelectItem>
                </SelectContent>
              </Select>

              {/* Periodicity Filter */}
              <Select value={periodicityFilter} onValueChange={setPeriodicityFilter}>
                <SelectTrigger className="w-[180px] border-[#DDDDDD]" style={{ height: "48px" }}>
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <SelectValue placeholder="Periodicidad" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las periodicidades</SelectItem>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>

              {/* File Type Filter */}
              <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                <SelectTrigger className="w-[180px] border-[#DDDDDD]" style={{ height: "48px" }}>
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <FileText className="w-4 h-4 shrink-0" />
                    <SelectValue placeholder="Tipo de archivo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los archivos</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="in transit">In transit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={`/data-quality/alerts?countryId=${countryId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Button variant="outline" className="h-12">
                  <BellSimpleRinging size={18} />
                  Alertas
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
            scrollHeight={height - 420}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>
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
