"use client";

import { useState } from "react";

import {
  Search,
  Calendar,
  FileText,
  Filter,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/modules/chat/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/modules/chat/ui/dialog";
import { Button } from "@/modules/chat/ui/button";
import { Label } from "@/modules/chat/ui/label";
import { Input } from "@/modules/chat/ui/input";
import { Switch } from "@/modules/chat/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import { Card, CardContent } from "@/modules/chat/ui/card";

const mockClients = {
  colombia: [
    {
      id: "farmacia-cruz-verde",
      name: "Farmacia Cruz Verde",
      type: "client",
      files: 15,
      lastUpdate: "2024-04-29",
      status: "processed",
      alerts: 0,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales", "In transit"]
    },
    {
      id: "drogueria-colsubsidio",
      name: "Droguería Colsubsidio",
      type: "client",
      files: 8,
      lastUpdate: "2024-04-28",
      status: "pending",
      alerts: 0,
      periodicity: "Weekly",
      fileTypes: ["Stock", "Sales"]
    },
    {
      id: "farmatodo-colombia",
      name: "Farmatodo Colombia",
      type: "client",
      files: 22,
      lastUpdate: "2024-04-29",
      status: "with-alert",
      alerts: 5,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales", "In transit"]
    },
    {
      id: "locatel-colombia",
      name: "Locatel Colombia",
      type: "client",
      files: 12,
      lastUpdate: "2024-04-27",
      status: "partial",
      alerts: 0,
      periodicity: "Monthly",
      fileTypes: ["Sales"]
    },
    {
      id: "cafam",
      name: "Cafam",
      type: "client",
      files: 18,
      lastUpdate: "2024-04-29",
      status: "processed",
      alerts: 0,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales"]
    },
    {
      id: "drogueria-la-rebaja",
      name: "Droguería La Rebaja",
      type: "client",
      files: 25,
      lastUpdate: "2024-04-28",
      status: "processed",
      alerts: 0,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales", "In transit"]
    },
    {
      id: "copidrogas",
      name: "Copidrogas",
      type: "client",
      files: 14,
      lastUpdate: "2024-04-27",
      status: "pending",
      alerts: 0,
      periodicity: "Weekly",
      fileTypes: ["Stock", "Sales"]
    },
    {
      id: "drogas-la-economia",
      name: "Drogas La Economía",
      type: "client",
      files: 9,
      lastUpdate: "2024-04-26",
      status: "with-alert",
      alerts: 2,
      periodicity: "Daily",
      fileTypes: ["Sales"]
    },
    {
      id: "farmacias-medicity",
      name: "Farmacias Medicity",
      type: "client",
      files: 11,
      lastUpdate: "2024-04-29",
      status: "partial",
      alerts: 0,
      periodicity: "Weekly",
      fileTypes: ["Stock", "Sales"]
    },
    {
      id: "drogueria-comfandi",
      name: "Droguería Comfandi",
      type: "client",
      files: 16,
      lastUpdate: "2024-04-28",
      status: "processed",
      alerts: 0,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales", "In transit"]
    },
    {
      id: "farmacias-pasteur",
      name: "Farmacias Pasteur",
      type: "client",
      files: 7,
      lastUpdate: "2024-04-27",
      status: "pending",
      alerts: 0,
      periodicity: "Monthly",
      fileTypes: ["Sales"]
    },
    {
      id: "drogueria-olimpica",
      name: "Droguería Olímpica",
      type: "client",
      files: 20,
      lastUpdate: "2024-04-29",
      status: "processed",
      alerts: 0,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales"]
    },
    {
      id: "farmacias-la-sante",
      name: "Farmacias La Santé",
      type: "client",
      files: 13,
      lastUpdate: "2024-04-26",
      status: "with-alert",
      alerts: 3,
      periodicity: "Weekly",
      fileTypes: ["Stock", "Sales", "In transit"]
    },
    {
      id: "drogueria-comfenalco",
      name: "Droguería Comfenalco",
      type: "client",
      files: 10,
      lastUpdate: "2024-04-28",
      status: "partial",
      alerts: 0,
      periodicity: "Daily",
      fileTypes: ["Sales"]
    },
    {
      id: "farmacias-vivir-bien",
      name: "Farmacias Vivir Bien",
      type: "client",
      files: 19,
      lastUpdate: "2024-04-29",
      status: "processed",
      alerts: 0,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales", "In transit"]
    },
    {
      id: "drogueria-comfamiliar",
      name: "Droguería Comfamiliar",
      type: "client",
      files: 8,
      lastUpdate: "2024-04-27",
      status: "pending",
      alerts: 0,
      periodicity: "Weekly",
      fileTypes: ["Stock", "Sales"]
    },
    {
      id: "farmacias-saludcoop",
      name: "Farmacias Saludcoop",
      type: "client",
      files: 21,
      lastUpdate: "2024-04-28",
      status: "processed",
      alerts: 0,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales"]
    },
    {
      id: "drogueria-compensar",
      name: "Droguería Compensar",
      type: "client",
      files: 15,
      lastUpdate: "2024-04-26",
      status: "with-alert",
      alerts: 1,
      periodicity: "Monthly",
      fileTypes: ["Sales"]
    }
  ],
  mexico: [
    {
      id: "farmacias-guadalajara",
      name: "Farmacias Guadalajara",
      type: "client",
      files: 18,
      lastUpdate: "2024-04-29",
      status: "processed",
      alerts: 0,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales", "In transit"]
    },
    {
      id: "farmacias-del-ahorro",
      name: "Farmacias del Ahorro",
      type: "client",
      files: 14,
      lastUpdate: "2024-04-28",
      status: "pending",
      alerts: 0,
      periodicity: "Weekly",
      fileTypes: ["Stock", "Sales"]
    }
  ],
  peru: [
    {
      id: "inkafarma",
      name: "InkaFarma",
      type: "client",
      files: 20,
      lastUpdate: "2024-04-29",
      status: "processed",
      alerts: 0,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales", "In transit"]
    },
    {
      id: "mifarma",
      name: "MiFarma",
      type: "client",
      files: 16,
      lastUpdate: "2024-04-28",
      status: "with-alert",
      alerts: 4,
      periodicity: "Daily",
      fileTypes: ["Stock", "Sales"]
    }
  ]
};

const countryNames = {
  colombia: "Colombia",
  mexico: "México",
  peru: "Perú",
  chile: "Chile",
  argentina: "Argentina",
  ecuador: "Ecuador"
};

const getStatusBadge = (status: string, alerts?: number) => {
  if (alerts && alerts > 0) {
    return (
      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
        Con novedad ({alerts})
      </Badge>
    );
  }

  switch (status) {
    case "processed":
      return (
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
          Procesado
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
          Pendiente
        </Badge>
      );
    case "with-alert":
      return (
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
          Con novedad
        </Badge>
      );
    case "partial":
      return (
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
          Procesado parcial
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Activo
        </Badge>
      );
  }
};

export default function CountriesClientsView() {
  const countryId = "colombia";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodicityFilter, setPeriodicityFilter] = useState("all");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [selectedPeriodicity, setSelectedPeriodicity] = useState<
    "Daily" | "Weekly" | "Monthly" | ""
  >("");
  const [selectedFileType, setSelectedFileType] = useState("");
  const [dailyDetails, setDailyDetails] = useState({
    diasHabiles: false,
    festivos: false
  });
  const [weeklyDetails, setWeeklyDetails] = useState({
    acumulado: false,
    porRango: false
  });
  const [ingestaSource, setIngestaSource] = useState("");
  const [ingestaDetail, setIngestaDetail] = useState(""); // Declared ingestaDetail variable
  const [stakeholder, setStakeholder] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [ingestaVariables, setIngestaVariables] = useState<{ key: string; value: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState({
    sales: false,
    stock: false,
    inTransit: false
  });

  const clients = mockClients[countryId as keyof typeof mockClients] || [];
  const countryName = countryNames[countryId as keyof typeof countryNames] || countryId;

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesPeriodicity =
      periodicityFilter === "all" || client.periodicity === periodicityFilter;
    const matchesFileType =
      fileTypeFilter === "all" ||
      client.fileTypes.some((ft) => ft.toLowerCase() === fileTypeFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPeriodicity && matchesFileType;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  const statusCounts = {
    all: clients.length,
    processed: clients.filter((c) => c.status === "processed").length,
    pending: clients.filter((c) => c.status === "pending").length,
    "with-alert": clients.filter((c) => c.status === "with-alert").length,
    partial: clients.filter((c) => c.status === "partial").length
  };

  const handleCreateIngestion = () => {
    console.log("[v0] Creating ingestion:", {
      clientName,
      periodicity: selectedPeriodicity,
      fileType: selectedFileType,
      dailyDetails: selectedPeriodicity === "Daily" ? dailyDetails : undefined,
      weeklyDetails: selectedPeriodicity === "Weekly" ? weeklyDetails : undefined,
      ingestaSource,
      ingestaVariables: ingestaVariables.filter((v) => v.key && v.value),
      stakeholder,
      attachedFile: attachedFile?.name
    });
    setIsModalOpen(false);
    setClientName("");
    setSelectedPeriodicity("");
    setSelectedFileType("");
    setDailyDetails({ diasHabiles: false, festivos: false });
    setWeeklyDetails({ acumulado: false, porRango: false });
    setIngestaSource("");
    setIngestaVariables([{ key: "", value: "" }]); // Declared setIngestaDetail variable
    setStakeholder("");
    setAttachedFile(null);
    setIngestaVariables([]);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/data-quality">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Inicio
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#141414]">{countryName}</h1>
      </div>

      {/* Main Content */}
      <Card className="bg-white border-[#DDDDDD] p-0">
        <CardContent className="p-6">
          {/* Filter Bar */}
          <div className="flex items-center gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#141414]" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#DDDDDD]"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] border-[#DDDDDD]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full">
                    <span>Todos los estados</span>
                    <Badge variant="secondary" className="ml-2">
                      {statusCounts.all}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="processed">
                  <div className="flex items-center justify-between w-full">
                    <span>Procesado</span>
                    <Badge variant="secondary" className="ml-2">
                      {statusCounts.processed}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center justify-between w-full">
                    <span>Pendiente</span>
                    <Badge variant="secondary" className="ml-2">
                      {statusCounts.pending}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="with-alert">
                  <div className="flex items-center justify-between w-full">
                    <span>Con novedad</span>
                    <Badge variant="secondary" className="ml-2">
                      {statusCounts["with-alert"]}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="partial">
                  <div className="flex items-center justify-between w-full">
                    <span>Procesado parcial</span>
                    <Badge variant="secondary" className="ml-2">
                      {statusCounts.partial}
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Periodicity Filter */}
            <Select value={periodicityFilter} onValueChange={setPeriodicityFilter}>
              <SelectTrigger className="w-[180px] border-[#DDDDDD]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Periodicidad" />
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
              <SelectTrigger className="w-[180px] border-[#DDDDDD]">
                <FileText className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo de archivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los archivos</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="in transit">In transit</SelectItem>
              </SelectContent>
            </Select>

            {/* Create Ingestion Button */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="ml-auto bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none">
                  <Upload className="w-4 h-4 mr-2" />
                  Crear nueva ingesta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                {/* Dialog Header */}
                <DialogHeader>
                  <DialogTitle>Crear Nueva Ingesta</DialogTitle>
                  <DialogDescription>
                    Configure los detalles de la nueva ingesta de datos para {countryName}
                  </DialogDescription>
                </DialogHeader>

                {/* Dialog Content */}
                <div className="grid gap-6 py-4">
                  {/* Cliente Input */}
                  <div className="grid gap-2">
                    <Label htmlFor="client-name">Cliente</Label>
                    <Input
                      id="client-name"
                      placeholder="Nombre del cliente"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="border-[#DDDDDD]"
                    />
                  </div>

                  {/* Tipo de Archivo Dropdown */}
                  <div className="grid gap-2">
                    <Label>Tipo de Archivo</Label>
                    <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                      <SelectTrigger className="w-full border-[#DDDDDD]">
                        <SelectValue placeholder="Seleccionar tipo de archivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Stock">Stock</SelectItem>
                        <SelectItem value="In transit">In transit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Periodicidad Toggles */}
                  <div className="grid gap-2">
                    <Label>Periodicidad</Label>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={selectedPeriodicity === "Daily"}
                          onCheckedChange={(checked) => {
                            setSelectedPeriodicity(checked ? "Daily" : "");
                            if (!checked) {
                              setDailyDetails({ diasHabiles: false, festivos: false });
                            }
                          }}
                        />
                        <span className="text-sm">Daily</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={selectedPeriodicity === "Weekly"}
                          onCheckedChange={(checked) => {
                            setSelectedPeriodicity(checked ? "Weekly" : "");
                            if (!checked) {
                              setWeeklyDetails({ acumulado: false, porRango: false });
                            }
                          }}
                        />
                        <span className="text-sm">Weekly</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={selectedPeriodicity === "Monthly"}
                          onCheckedChange={(checked) =>
                            setSelectedPeriodicity(checked ? "Monthly" : "")
                          }
                        />
                        <span className="text-sm">Monthly</span>
                      </div>
                    </div>
                  </div>

                  {selectedPeriodicity === "Daily" && (
                    <div className="grid gap-2">
                      <Label>Detalle</Label>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={dailyDetails.diasHabiles}
                            onCheckedChange={(checked) =>
                              setDailyDetails((prev) => ({ ...prev, diasHabiles: checked }))
                            }
                          />
                          <span className="text-sm">Días hábiles</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={dailyDetails.festivos}
                            onCheckedChange={(checked) =>
                              setDailyDetails((prev) => ({ ...prev, festivos: checked }))
                            }
                          />
                          <span className="text-sm">Festivos</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPeriodicity === "Weekly" && (
                    <div className="grid gap-2">
                      <Label>Detalle</Label>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={weeklyDetails.acumulado}
                            onCheckedChange={(checked) =>
                              setWeeklyDetails((prev) => ({ ...prev, acumulado: checked }))
                            }
                          />
                          <span className="text-sm">Acumulado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={weeklyDetails.porRango}
                            onCheckedChange={(checked) =>
                              setWeeklyDetails((prev) => ({ ...prev, porRango: checked }))
                            }
                          />
                          <span className="text-sm">Por rango</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="ingesta">Ingesta</Label>
                    <Select value={ingestaSource} onValueChange={setIngestaSource}>
                      <SelectTrigger className="w-full border-[#DDDDDD]">
                        <SelectValue placeholder="Seleccionar fuente de ingesta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="b2b-web">B2B Web</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="app">App</SelectItem>
                        <SelectItem value="teamcorp">Teamcorp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="stakeholder">Stakeholder</Label>
                    <Select value={stakeholder} onValueChange={setStakeholder}>
                      <SelectTrigger className="w-full border-[#DDDDDD]">
                        <SelectValue placeholder="Seleccionar responsable" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="juan-perez">Juan Pérez</SelectItem>
                        <SelectItem value="maria-garcia">María García</SelectItem>
                        <SelectItem value="carlos-rodriguez">Carlos Rodríguez</SelectItem>
                        <SelectItem value="ana-martinez">Ana Martínez</SelectItem>
                        <SelectItem value="luis-fernandez">Luis Fernández</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* File Attachment Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="file-attachment">Adjunto (opcional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="file-attachment"
                        type="file"
                        onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                        className="border-[#DDDDDD]"
                      />
                      {attachedFile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAttachedFile(null)}
                          className="text-red-600"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                    {attachedFile && (
                      <p className="text-xs text-gray-600">
                        Archivo seleccionado: {attachedFile.name}
                      </p>
                    )}
                  </div>

                  {/* Variables de configuración - Al final */}
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Variables de configuración</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setIngestaVariables([...ingestaVariables, { key: "", value: "" }])
                        }
                        className="text-xs bg-transparent"
                      >
                        + Agregar variable
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {ingestaVariables.map((variable, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="Nombre (ej: EMAIL, API_URL)"
                            value={variable.key}
                            onChange={(e) => {
                              const newVariables = [...ingestaVariables];
                              newVariables[index].key = e.target.value;
                              setIngestaVariables(newVariables);
                            }}
                            className="border-[#DDDDDD] flex-1 font-mono text-sm"
                          />
                          <Input
                            placeholder="Valor"
                            value={variable.value}
                            onChange={(e) => {
                              const newVariables = [...ingestaVariables];
                              newVariables[index].value = e.target.value;
                              setIngestaVariables(newVariables);
                            }}
                            className="border-[#DDDDDD] flex-1"
                          />
                          {ingestaVariables.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newVariables = ingestaVariables.filter((_, i) => i !== index);
                                setIngestaVariables(newVariables);
                              }}
                              className="text-red-600 hover:text-red-700 px-2"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Agregue variables como EMAIL, API_URL, PASSWORD, etc.
                    </p>
                  </div>
                </div>

                {/* Dialog Footer */}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateIngestion}
                    disabled={
                      !clientName ||
                      !selectedPeriodicity ||
                      (!selectedFiles.sales && !selectedFiles.stock && !selectedFiles.inTransit)
                    }
                    className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
                  >
                    Crear Ingesta
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Clients Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-[#DDDDDD]">
                <TableHead className="text-[#141414]">Nombre</TableHead>
                <TableHead className="text-[#141414]">Periodicidad</TableHead>
                <TableHead className="text-[#141414]">Archivos</TableHead>
                <TableHead className="text-[#141414]">Fecha de actualización</TableHead>
                <TableHead className="text-[#141414]">Estado</TableHead>
                <TableHead className="text-[#141414]">Ver</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="hover:bg-gray-50 cursor-pointer border-[#DDDDDD]"
                >
                  <TableCell>
                    <Link
                      href={`/data-quality/clients/${client.id}`}
                      className="font-medium hover:underline text-[#141414]"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {client.periodicity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {client.fileTypes.map((fileType) => {
                        const initials =
                          fileType === "Stock" ? "ST" : fileType === "Sales" ? "SA" : "IT";
                        const bgColor =
                          fileType === "Stock"
                            ? "bg-blue-500"
                            : fileType === "Sales"
                              ? "bg-green-500"
                              : "bg-purple-500";
                        return (
                          <div
                            key={fileType}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white ${bgColor}`}
                            title={fileType}
                          >
                            {initials}
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#141414]" />
                      <span className="text-[#141414]">{client.lastUpdate}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(client.status, client.alerts)}</TableCell>
                  <TableCell>
                    <Link href={`/data-quality/clients/${client.id}`}>
                      <Button variant="ghost" size="sm" title="Ver detalles del cliente">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-[#141414]">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClients.length)} de{" "}
              {filteredClients.length} clientes
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-[#DDDDDD]"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? "bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
                        : "border-[#DDDDDD]"
                    }
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-[#DDDDDD]"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
