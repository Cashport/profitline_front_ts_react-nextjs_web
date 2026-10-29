"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot } from "lucide-react";
import { Select as AntSelect } from "antd";

import { getAlertsFilters } from "@/services/dataQuality/dataQuality";
import { useDataQualityAlerts } from "../../hooks/useDataQualityAlerts";

import Header from "@/components/organisms/header";
import UiSearchInput from "@/components/ui/search-input";
import { Button } from "@/modules/chat/ui/button";

import { AlertsTable } from "../../components/AlertsTable";
import { AlertCategoryCards } from "../../components/alert-category-cards";

import {
  IAlertFilterCountry,
  IAlertFilterClient,
  IAlertFilterCategory,
  IGetAlerts
} from "@/types/dataQuality/IDataQuality";

export default function NoveltyAlertsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const countryIdParam = searchParams.get("countryId");
  const clientIdParam = searchParams.get("clientId");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState(countryIdParam ?? "all");
  const [clientFilter, setClientFilter] = useState(clientIdParam ?? "all");
  const [currentPage, setCurrentPage] = useState(1);

  const [filtersData, setFiltersData] = useState<{
    countries: IAlertFilterCountry[];
    clients: IAlertFilterClient[];
    types: string[];
    categories: IAlertFilterCategory[];
  }>({ countries: [], clients: [], types: [], categories: [] });

  useEffect(() => {
    getAlertsFilters()
      .then((data) =>
        setFiltersData({
          countries: data.countries,
          clients: data.clients,
          types: data.types,
          categories: data.categories ?? []
        })
      )
      .catch((error) => {
        console.error("Error fetching alerts filters:", error);
      });
  }, []);

  // Las tarjetas espejan el select de tipos: una categoría está activa cuando todos sus
  // error_types ya están aplicados, así que el filtro es la única fuente de verdad.
  const activeKeys = filtersData.categories
    .filter((c) => c.error_types.length > 0 && c.error_types.every((t) => typeFilter.includes(t)))
    .map((c) => c.key);

  const handleCategoryClick = (category: IAlertFilterCategory) => {
    const isActive = activeKeys.includes(category.key);
    setTypeFilter((prev) =>
      isActive
        ? prev.filter((t) => !category.error_types.includes(t))
        : Array.from(new Set([...prev, ...category.error_types]))
    );
  };

  const visibleClients =
    countryFilter === "all"
      ? filtersData.clients
      : filtersData.clients.filter((client) => String(client.id_country) === countryFilter);

  const handleCountryChange = (value: string) => {
    setCountryFilter(value);
    const selectedClient = filtersData.clients.find((c) => String(c.client_id) === clientFilter);
    if (value !== "all" && selectedClient && String(selectedClient.id_country) !== value) {
      setClientFilter("all");
    }
  };

  const hasActiveFilters =
    typeFilter.length > 0 || countryFilter !== "all" || clientFilter !== "all";

  const handleClearFilters = () => {
    setTypeFilter([]);
    setCountryFilter("all");
    setClientFilter("all");
  };

  const {
    data: alertsResponse,
    isLoading,
    error
  } = useDataQualityAlerts(
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
    <div className="cp-page">
      <Header
        title="Alertas y Novedades"
        back="/data-quality"
        actionsExtra={
          <Button
            variant="outline"
            onClick={() => router.push("/data-quality/automations")}
            className="whitespace-nowrap"
          >
            <Bot className="h-4 w-4 mr-1" />
            Automatizaciones
          </Button>
        }
      />

      <div className="cp-card px-[18px] py-[14px]">
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
            <AntSelect
              showSearch
              optionFilterProp="label"
              value={countryFilter}
              onChange={handleCountryChange}
              placeholder="Todos los países"
              className="w-48"
              style={{ minWidth: "12rem", height: "var(--control-h)" }}
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
              style={{ minWidth: "12rem", height: "var(--control-h)" }}
              options={[
                { label: "Todos los clientes", value: "all" },
                ...visibleClients.map((client) => ({
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
              style={{ minWidth: "12rem", height: "var(--control-h)" }}
              options={filtersData.types.map((type) => ({ label: type, value: type }))}
              maxTagCount="responsive"
            />

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="whitespace-nowrap h-[var(--control-h)]"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        <AlertCategoryCards
          categories={filtersData.categories}
          activeKeys={activeKeys}
          onCategoryClick={handleCategoryClick}
        />

        {/* Alerts Table */}
        <div className="pt-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "#141414" }}>
            Lista de Alertas y Novedades
          </h3>
          {error ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="text-red-600">
                {error instanceof Error
                  ? error.message
                  : "No se pudo cargar la información de alertas."}
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
