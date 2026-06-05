"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Select as AntSelect } from "antd";

import { getAlertsFilters } from "@/services/dataQuality/dataQuality";
import { useDataQualityAlerts } from "../../hooks/useDataQualityAlerts";

import Header from "@/components/organisms/header";
import { Card, CardContent } from "@/modules/chat/ui/card";
import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";

import { AlertsTable } from "../../components/AlertsTable";

import {
  IAlertFilterCountry,
  IAlertFilterClient,
  IGetAlerts
} from "@/types/dataQuality/IDataQuality";

export default function NoveltyAlertsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const countryIdParam = searchParams.get("countryId");
  const clientIdParam = searchParams.get("clientId");

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/data-quality");
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState(countryIdParam ?? "all");
  const [clientFilter, setClientFilter] = useState(clientIdParam ?? "all");
  const [currentPage, setCurrentPage] = useState(1);

  const [filtersData, setFiltersData] = useState<{
    countries: IAlertFilterCountry[];
    clients: IAlertFilterClient[];
    types: string[];
  }>({ countries: [], clients: [], types: [] });

  useEffect(() => {
    getAlertsFilters().then((data) =>
      setFiltersData({ countries: data.countries, clients: data.clients, types: data.types })
    );
  }, []);

  const { data: alertsResponse, isLoading } = useDataQualityAlerts(
    currentPage,
    10,
    searchTerm || undefined,
    countryFilter !== "all" ? Number(countryFilter) : undefined,
    clientFilter !== "all" ? Number(clientFilter) : undefined,
    typeFilter.length ? typeFilter : undefined
  );

  const alertsData = alertsResponse as unknown as IGetAlerts | undefined;
  const alerts = alertsData?.data ?? [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, countryFilter, clientFilter]);

  return (
    <div className="flex flex-col gap-4">
      <Header title="Alertas y Novedades" />
      <Card className="p-0 border-none">
        <CardContent className="pt-6">
          {/* Compact Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Atrás
              </Button>
              {/* Search Input */}
              <div className="flex-1 min-w-64">
                <UiSearchInput
                  placeholder="Buscar alertas..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Country Filter */}
              <AntSelect
                showSearch
                optionFilterProp="label"
                value={countryFilter}
                onChange={setCountryFilter}
                placeholder="Todos los países"
                className="w-48"
                style={{ minWidth: "12rem", height: "48px" }}
                options={[
                  { label: "Todos los países", value: "all" },
                  ...filtersData.countries.map((country) => ({
                    label: country.country_name,
                    value: String(country.id)
                  }))
                ]}
              />

              {/* Client Filter */}
              <AntSelect
                showSearch
                optionFilterProp="label"
                value={clientFilter}
                onChange={setClientFilter}
                placeholder="Todos los clientes"
                className="w-48"
                style={{ minWidth: "12rem", height: "48px" }}
                options={[
                  { label: "Todos los clientes", value: "all" },
                  ...filtersData.clients.map((client) => ({
                    label: client.client_name,
                    value: String(client.client_id)
                  }))
                ]}
              />

              {/* Type Filter */}
              <AntSelect
                mode="multiple"
                allowClear
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Todos los tipos"
                className="w-48"
                style={{ minWidth: "12rem", height: "48px" }}
                options={filtersData.types.map((type) => ({ label: type, value: type }))}
                maxTagCount="responsive"
              />

              {/* Clear Filters Button */}
              <Button
                variant="outline"
                onClick={() => {
                  setTypeFilter([]);
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
    </div>
  );
}
