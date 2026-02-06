"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Filter, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/modules/chat/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import { Spin } from "antd";

import { useDataQualityAlerts } from "../../hooks/useDataQualityAlerts";
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

  const [filtersData, setFiltersData] = useState<{
    countries: IAlertFilterCountry[];
    clients: IAlertFilterClient[];
    alertStatus: IAlertFilterStatus[];
  }>({ countries: [], clients: [], alertStatus: [] });

  useEffect(() => {
    getAlertsFilters().then((data) => setFiltersData(data));
  }, []);

  const { data: alertsData, isLoading } = useDataQualityAlerts(
    1,
    50,
    searchTerm || undefined,
    countryFilter !== "all" ? Number(countryFilter) : undefined,
    clientFilter !== "all" ? Number(clientFilter) : undefined,
    statusFilter !== "all" ? Number(statusFilter) : undefined
  );

  const alertsResponse = alertsData as unknown as IGetAlerts | undefined;
  const alerts = alertsResponse?.data ?? [];

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
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: "#DDDDDD" }}>
                    <TableHead style={{ color: "#141414" }}>Cliente</TableHead>
                    <TableHead style={{ color: "#141414" }}>País</TableHead>
                    <TableHead style={{ color: "#141414" }}>Novedad</TableHead>
                    <TableHead style={{ color: "#141414" }}>Tipo</TableHead>
                    <TableHead style={{ color: "#141414" }}>Fecha novedad</TableHead>
                    <TableHead style={{ color: "#141414" }}>Prioridad</TableHead>
                    <TableHead style={{ color: "#141414" }}>Estado</TableHead>
                    <TableHead style={{ color: "#141414" }}>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow
                      key={alert.id}
                      className="hover:bg-gray-50"
                      style={{ borderColor: "#DDDDDD" }}
                    >
                      <TableCell>
                        <span className="font-medium" style={{ color: "#141414" }}>
                          {alert.client_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {alert.country_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-sm truncate max-w-xs block"
                          style={{ color: "#141414" }}
                        >
                          {alert.error_message}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {alert.error_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm" style={{ color: "#141414" }}>
                          {alert.created_at}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {alert.error_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: alert.status_color }}
                          />
                          <span className="text-sm">{alert.status_description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/data-quality/clients/${alert.id_client}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-transparent"
                              title="Ir al catálogo del cliente"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Catálogo
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="mt-6 text-sm" style={{ color: "#141414" }}>
        Mostrando {alerts.length} de {alertsResponse?.total ?? 0} alertas
      </div>
    </main>
  );
}
