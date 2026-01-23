"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Filter,
  ExternalLink,
  AlertTriangle,
  XCircle,
  Clock,
  FileX,
  ArrowLeft
} from "lucide-react";
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

// Mock data for alerts/news
const mockAlerts = [
  {
    id: "1",
    client: "Farmacia Cruz Verde",
    country: "Colombia",
    countryId: "colombia",
    clientId: "farmacia-cruz-verde",
    alert: "Productos sin mapear en catálogo",
    alertType: "catalog",
    date: "2024-04-29",
    time: "14:30",
    priority: "high",
    status: "pending"
  },
  {
    id: "2",
    client: "Droguería Colsubsidio",
    country: "Colombia",
    countryId: "colombia",
    clientId: "drogueria-colsubsidio",
    alert: "Error en procesamiento de archivo ventas-abril-2024.xlsx",
    alertType: "processing",
    date: "2024-04-28",
    time: "10:20",
    priority: "high",
    status: "pending"
  }
];

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return (
        <Badge variant="destructive" className="text-xs">
          Alta
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
          Media
        </Badge>
      );
    case "low":
      return (
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
          Baja
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Desconocida
        </Badge>
      );
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
          Pendiente
        </Badge>
      );
    case "resolved":
      return (
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
          Resuelto
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Desconocido
        </Badge>
      );
  }
};

const getAlertIcon = (alertType: string) => {
  switch (alertType) {
    case "catalog":
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    case "processing":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "format":
      return <FileX className="w-4 h-4 text-red-600" />;
    case "missing":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "data":
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-gray-600" />;
  }
};

const getAlertTypeLabel = (alertType: string) => {
  switch (alertType) {
    case "catalog":
      return "Catálogo";
    case "processing":
      return "Procesamiento";
    case "format":
      return "Formato";
    case "missing":
      return "Archivo faltante";
    case "data":
      return "Datos";
    default:
      return "Otro";
  }
};

export default function NoveltyAlertsView() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/data-quality');
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesSearch =
      alert.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || alert.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    const matchesCountry = countryFilter === "all" || alert.country === countryFilter;
    const matchesClient = clientFilter === "all" || alert.client === clientFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesCountry && matchesClient;
  });

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
                <SelectTrigger className="w-48" style={{ borderColor: "#DDDDDD", height: "48px" }}>
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <Filter className="w-4 h-4 shrink-0" />
                    <SelectValue placeholder="Todos los países" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center justify-between w-full">
                      <span>Todos los países</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockAlerts.length}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="Colombia">
                    <div className="flex items-center justify-between w-full">
                      <span>Colombia</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockAlerts.filter((a) => a.country === "Colombia").length}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="México">
                    <div className="flex items-center justify-between w-full">
                      <span>México</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockAlerts.filter((a) => a.country === "México").length}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="Perú">
                    <div className="flex items-center justify-between w-full">
                      <span>Perú</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockAlerts.filter((a) => a.country === "Perú").length}
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Client Filter */}
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-48" style={{ borderColor: "#DDDDDD", height: "48px" }}>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <SelectValue placeholder="Todos los clientes" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center justify-between w-full">
                      <span>Todos los clientes</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockAlerts.length}
                      </Badge>
                    </div>
                  </SelectItem>
                  {Array.from(new Set(mockAlerts.map((a) => a.client))).map((client) => (
                    <SelectItem key={client} value={client}>
                      <div className="flex items-center justify-between w-full">
                        <span>{client}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {mockAlerts.filter((a) => a.client === client).length}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" style={{ borderColor: "#DDDDDD", height: "48px" }}>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <SelectValue placeholder="Todos los estados" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center justify-between w-full">
                      <span>Todos los estados</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockAlerts.length}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                        <span>Pendiente</span>
                      </div>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockAlerts.filter((a) => a.status === "pending").length}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span>Resuelto</span>
                      </div>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {mockAlerts.filter((a) => a.status === "resolved").length}
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              <Button
                variant="outline"
                onClick={() => {
                  setPriorityFilter("all");
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
                {filteredAlerts.map((alert) => (
                  <TableRow
                    key={alert.id}
                    className="hover:bg-gray-50"
                    style={{ borderColor: "#DDDDDD" }}
                  >
                    <TableCell>
                      <span className="font-medium" style={{ color: "#141414" }}>
                        {alert.client}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {alert.country}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 max-w-xs">
                        {getAlertIcon(alert.alertType)}
                        <span className="text-sm truncate" style={{ color: "#141414" }}>
                          {alert.alert}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getAlertTypeLabel(alert.alertType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm" style={{ color: "#141414" }}>
                        <div>{alert.date}</div>
                        <div className="text-xs text-gray-500">{alert.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(alert.priority)}</TableCell>
                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Link href={`/data-quality/clients/${alert.clientId}`}>
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
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="mt-6 text-sm" style={{ color: "#141414" }}>
        Mostrando {filteredAlerts.length} de {mockAlerts.length} alertas
      </div>
    </main>
  );
}
