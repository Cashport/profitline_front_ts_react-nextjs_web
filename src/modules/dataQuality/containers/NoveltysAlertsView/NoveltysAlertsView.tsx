"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Filter, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/modules/chat/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";

import { useDataQualityAlerts } from "../../hooks/useDataQualityAlerts";
import { AlertsTable } from "../../components/AlertsTable";
import { getAlertsFilters } from "@/services/dataQuality/dataQuality";
import {
  IAlertFilterCountry,
  IAlertFilterClient,
  IAlertFilterStatus,
  IGetAlerts
} from "@/types/dataQuality/IDataQuality";

export default function NoveltyAlertsView() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/data-quality");
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [filtersData, setFiltersData] = useState<{
    countries: IAlertFilterCountry[];
    clients: IAlertFilterClient[];
    alertStatus: IAlertFilterStatus[];
  }>({ countries: [], clients: [], alertStatus: [] });

  useEffect(() => {
    getAlertsFilters().then((data) => setFiltersData(data));
  }, []);

  const { data: alertsResponse, isLoading } = useDataQualityAlerts(
    currentPage,
    10,
    searchTerm || undefined,
    countryFilter !== "all" ? Number(countryFilter) : undefined,
    clientFilter !== "all" ? Number(clientFilter) : undefined,
    statusFilter !== "all" ? Number(statusFilter) : undefined
  );

  const alertsData = alertsResponse as unknown as IGetAlerts | undefined;
  const alerts = alertsData?.data ?? [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, countryFilter, clientFilter]);

  return (
    <main>
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-gray-900"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Atrás
        </Button>
        <h1 className="text-2xl font-bold" style={{ color: "#141414" }}>
          Alertas y Novedades
        </h1>
      </div>

      <Card className="p-0" style={{ backgroundColor: "#FFFFFF", borderColor: "#DDDDDD" }}>
        <CardContent className="pt-6">
          {/* Compact Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search Input */}
              <div className="flex-1 min-w-64">
                <UiSearchInput
                  placeholder="Buscar alertas..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Country Filter */}
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger
                  className="w-48"
                  style={{ borderColor: "#DDDDDD", height: "48px" }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <Filter className="w-4 h-4 shrink-0" />
                    <SelectValue placeholder="Todos los países" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los países</SelectItem>
                  {filtersData.countries.map((country) => (
                    <SelectItem key={country.id} value={String(country.id)}>
                      {country.country_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Client Filter */}
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger
                  className="w-48"
                  style={{ borderColor: "#DDDDDD", height: "48px" }}
                >
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <SelectValue placeholder="Todos los clientes" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {filtersData.clients.map((client) => (
                    <SelectItem key={client.client_id} value={String(client.client_id)}>
                      {client.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className="w-48"
                  style={{ borderColor: "#DDDDDD", height: "48px" }}
                >
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <SelectValue placeholder="Todos los estados" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {filtersData.alertStatus.map((status) => (
                    <SelectItem key={status.id} value={String(status.id)}>
                      <div className="flex items-center">
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: status.budget_color }}
                        />
                        <span>{status.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setCountryFilter("all");
                  setClientFilter("all");
                  setSearchTerm("");
                }}
                className="whitespace-nowrap h-12"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="border-t pt-6" style={{ borderColor: "#DDDDDD" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#141414" }}>
              Lista de Alertas y Novedades
            </h3>
            <AlertsTable
              alerts={alerts}
              isLoading={isLoading}
              pagination={{
                current: currentPage,
                total: alertsData?.total ?? 0,
                pageSize: alertsData?.limit ?? 10
              }}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
