"use client";

import { useState } from "react";

import {
  MoreHorizontal,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Edit,
  ArrowLeft
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
  DialogTitle
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

const mockFiles = {
  "farmacia-cruz-verde": [
    {
      id: "stock-2024-04-29.xlsx",
      name: "stock-2024-04-29.xlsx",
      type: "file",
      size: "2.4 MB",
      lastUpdate: "2024-04-29 14:30",
      status: "processed",
      category: "Stock"
    },
    {
      id: "sales-2024-04-29.csv",
      name: "sales-2024-04-29.csv",
      type: "file",
      size: "1.8 MB",
      lastUpdate: "2024-04-29 12:15",
      status: "processed",
      category: "Sales"
    },
    {
      id: "in-transit-2024-04-28.xlsx",
      name: "in-transit-2024-04-28.xlsx",
      type: "file",
      size: "3.1 MB",
      lastUpdate: "2024-04-28 16:45",
      status: "pending",
      category: "In transit"
    }
  ],
  "drogueria-colsubsidio": [
    {
      id: "sales-2024-04-28.xlsx",
      name: "sales-2024-04-28.xlsx",
      type: "file",
      size: "4.2 MB",
      lastUpdate: "2024-04-28 10:20",
      status: "processed",
      category: "Sales"
    },
    {
      id: "stock-2024-04-27.csv",
      name: "stock-2024-04-27.csv",
      type: "file",
      size: "1.5 MB",
      lastUpdate: "2024-04-27 18:30",
      status: "pending",
      category: "Stock"
    }
  ]
};

const clientConfigurations = {
  "farmacia-cruz-verde": {
    periodicity: "Daily",
    fileTypes: ["Stock", "Sales", "In transit"]
  },
  "drogueria-colsubsidio": {
    periodicity: "Weekly",
    fileTypes: ["Stock", "Sales"]
  },
  "farmatodo-colombia": {
    periodicity: "Daily",
    fileTypes: ["Stock", "Sales", "In transit"]
  },
  "locatel-colombia": {
    periodicity: "Monthly",
    fileTypes: ["Sales"]
  }
};

const countryNames = {
  colombia: "Colombia",
  mexico: "México",
  peru: "Perú",
  chile: "Chile",
  argentina: "Argentina",
  ecuador: "Ecuador"
};

const clientNames = {
  "farmacia-cruz-verde": "Farmacia Cruz Verde",
  "drogueria-colsubsidio": "Droguería Colsubsidio",
  "farmatodo-colombia": "Farmatodo Colombia",
  "locatel-colombia": "Locatel Colombia"
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "processed":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "pending-catalog":
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    default:
      return <Eye className="w-4 h-4" style={{ color: "#141414" }} />;
  }
};

const getStatusBadge = (status: string) => {
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
    case "error":
      return (
        <Badge variant="destructive" className="text-xs">
          Data con error
        </Badge>
      );
    case "pending-catalog":
      return (
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
          Pendiente catálogo
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

const getCategoryBadge = (category: string) => {
  const colors = {
    Stock: "bg-blue-100 text-blue-800",
    Sales: "bg-purple-100 text-purple-800",
    "In transit": "bg-orange-100 text-orange-800"
  };

  return (
    <Badge
      variant="secondary"
      className={`text-xs ${colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}
    >
      {category}
    </Badge>
  );
};

export default function DataQualityClientDetails() {
  const params = useParams();
  const router = useRouter();

  const countryId = params.countryId as string;
  const clientId = params.clientId as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editClientName, setEditClientName] = useState("");
  const [editPeriodicity, setEditPeriodicity] = useState<"Daily" | "Weekly" | "Monthly" | "">("");
  const [editFileTypes, setEditFileTypes] = useState({
    sales: false,
    stock: false,
    inTransit: false
  });
  const [editFileType, setEditFileType] = useState(""); // Declared editFileType
  const [editDailyDetails, setEditDailyDetails] = useState({
    diasHabiles: false,
    festivos: false
  });
  const [editWeeklyDetails, setEditWeeklyDetails] = useState({
    acumulado: false,
    porRango: false
  });
  const [editIngestaSource, setEditIngestaSource] = useState("");
  const [editIngestaDetail, setEditIngestaDetail] = useState(""); // Declared editIngestaDetail
  const [editStakeholder, setEditStakeholder] = useState("");
  const [editAttachedFile, setEditAttachedFile] = useState<File | null>(null);
  const [editIngestaVariables, setEditIngestaVariables] = useState([{ key: "", value: "" }]); // Declared editIngestaVariables

  const files = mockFiles[clientId as keyof typeof mockFiles] || [];
  const countryName = countryNames[countryId as keyof typeof countryNames] || countryId;
  const clientName = clientNames[clientId as keyof typeof clientNames] || clientId;
  const clientConfig = clientConfigurations[clientId as keyof typeof clientConfigurations] || {
    periodicity: "Daily",
    fileTypes: ["Stock", "Sales"]
  };

  const clientInfo = {
    ingestaSource: "Email",
    ingestaVariables: [
      { key: "EMAIL", value: "ventas@farmaciacruz.com" },
      { key: "CC", value: "reportes@farmaciacruz.com" }
    ],
    stakeholder: "Juan Pérez",
    dailyDetails: { diasHabiles: true, festivos: false },
    weeklyDetails: { acumulado: false, porRango: false }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditConfig = () => {
    setEditClientName(clientName);
    setEditPeriodicity(clientConfig.periodicity as "Daily" | "Weekly" | "Monthly");
    setEditFileTypes((prev) => ({ ...prev, sales: clientConfig.fileTypes.includes("Sales") }));
    setEditFileTypes((prev) => ({ ...prev, stock: clientConfig.fileTypes.includes("Stock") }));
    setEditFileTypes((prev) => ({
      ...prev,
      inTransit: clientConfig.fileTypes.includes("In transit")
    }));
    setEditDailyDetails(clientInfo.dailyDetails);
    setEditWeeklyDetails(clientInfo.weeklyDetails);
    setEditIngestaSource(clientInfo.ingestaSource);
    setEditIngestaVariables(
      clientInfo.ingestaVariables.length > 0
        ? [...clientInfo.ingestaVariables]
        : [{ key: "", value: "" }]
    );
    setEditStakeholder(clientInfo.stakeholder);
    setEditAttachedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleSaveConfig = () => {
    console.log("[v0] Saving configuration:", {
      clientName: editClientName,
      periodicity: editPeriodicity,
      fileType: editFileType,
      dailyDetails: editPeriodicity === "Daily" ? editDailyDetails : undefined,
      weeklyDetails: editPeriodicity === "Weekly" ? editWeeklyDetails : undefined,
      ingestaSource: editIngestaSource,
      ingestaVariables: editIngestaVariables.filter((v) => v.key && v.value), // Used editIngestaDetail
      stakeholder: editStakeholder,
      attachedFile: editAttachedFile?.name
    });
    setIsEditDialogOpen(false);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/data-quality");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F7F7" }}>
      <main className="px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "#141414" }}>
            {clientName}
          </h1>
        </div>

        <Card className="" style={{ backgroundColor: "#FFFFFF", borderColor: "#DDDDDD" }}>
          <CardContent>
            <div className="flex items-center justify-between mb-6 ">
              <div className="mb-6 flex items-center gap-4">
                <Button
                  onClick={handleGoBack}
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Atrás
                </Button>

                <h2 className="text-lg font-semibold" style={{ color: "#141414" }}>
                  Información general
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="text-sm font-medium"
                  style={{
                    backgroundColor: "#CBE71E",
                    color: "#141414",
                    border: "none"
                  }}
                >
                  Puntos de venta
                </Button>
                <Button
                  className="text-sm font-medium"
                  style={{
                    backgroundColor: "#CBE71E",
                    color: "#141414",
                    border: "none"
                  }}
                >
                  Catálogos
                </Button>
                <Button
                  variant="outline"
                  className="text-sm font-medium bg-transparent"
                  onClick={handleEditConfig}
                  style={{ borderColor: "#DDDDDD", color: "#141414" }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
                  Periodicidad
                </p>
                <Badge
                  variant="secondary"
                  className="text-sm font-medium"
                  style={{ backgroundColor: "#CBE71E", color: "#141414" }}
                >
                  {clientConfig.periodicity}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
                  Tipos de Archivo
                </p>
                <div className="flex flex-wrap gap-2">
                  {clientConfig.fileTypes.map((fileType) => (
                    <Badge
                      key={fileType}
                      variant="secondary"
                      className="text-sm font-medium bg-gray-200 text-gray-800"
                    >
                      {fileType}
                    </Badge>
                  ))}
                </div>
              </div>

              {clientConfig.periodicity === "Daily" && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
                    Detalle de Periodicidad
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {clientInfo.dailyDetails.diasHabiles && (
                      <Badge
                        variant="secondary"
                        className="text-sm font-medium bg-gray-200 text-gray-800"
                      >
                        Días hábiles
                      </Badge>
                    )}
                    {clientInfo.dailyDetails.festivos && (
                      <Badge
                        variant="secondary"
                        className="text-sm font-medium bg-gray-200 text-gray-800"
                      >
                        Festivos
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {clientConfig.periodicity === "Weekly" && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
                    Detalle de Periodicidad
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {clientInfo.weeklyDetails.acumulado && (
                      <Badge
                        variant="secondary"
                        className="text-sm font-medium bg-gray-200 text-gray-800"
                      >
                        Acumulado
                      </Badge>
                    )}
                    {clientInfo.weeklyDetails.porRango && (
                      <Badge
                        variant="secondary"
                        className="text-sm font-medium bg-gray-200 text-gray-800"
                      >
                        Por rango
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
                  Fuente de Ingesta
                </p>
                <p className="text-sm" style={{ color: "#141414" }}>
                  {clientInfo.ingestaSource}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
                  Variables de Configuración
                </p>
                <div className="flex flex-wrap gap-2">
                  {clientInfo.ingestaVariables.map((variable, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1"
                    >
                      <span className="text-xs font-mono font-semibold text-gray-700">
                        {variable.key}:
                      </span>
                      <span className="text-xs text-gray-600">{variable.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#141414" }}>
                  Stakeholder
                </p>
                <p className="text-sm" style={{ color: "#141414" }}>
                  {clientInfo.stakeholder}
                </p>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-6" style={{ color: "#141414" }}>
              Archivos
            </h2>
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "#DDDDDD" }}>
                  <TableHead style={{ color: "#141414", fontWeight: 600 }}>Nombre</TableHead>
                  <TableHead style={{ color: "#141414", fontWeight: 600 }}>
                    Tipo de archivo
                  </TableHead>
                  <TableHead style={{ color: "#141414", fontWeight: 600 }}>Fecha y hora</TableHead>
                  <TableHead style={{ color: "#141414", fontWeight: 600 }}>Tamaño</TableHead>
                  <TableHead style={{ color: "#141414", fontWeight: 600 }}>Estado</TableHead>
                  <TableHead style={{ color: "#141414", fontWeight: 600 }}>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    className="hover:bg-gray-50"
                    style={{ borderColor: "#DDDDDD" }}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(file.status)}
                        <span className="font-normal" style={{ color: "#141414" }}>
                          {file.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(file.category)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" style={{ color: "#141414" }} />
                        <span style={{ color: "#141414" }}>{file.lastUpdate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span style={{ color: "#141414" }}>{file.size}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(file.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" title="Ver archivo">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Descargar">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-4 text-sm" style={{ color: "#141414" }}>
          Mostrando {filteredFiles.length} de {files.length} archivos
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Parametrización</DialogTitle>
            <DialogDescription>
              Modifica la configuración de ingesta para {clientName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="edit-client-name">Cliente</Label>
              <Input
                id="edit-client-name"
                value={editClientName}
                onChange={(e) => setEditClientName(e.target.value)}
                className="border-[#DDDDDD]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Tipo de Archivo</Label>
              <Select value={editFileType} onValueChange={setEditFileType}>
                <SelectTrigger className="border-[#DDDDDD]">
                  <SelectValue placeholder="Seleccionar tipo de archivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Stock">Stock</SelectItem>
                  <SelectItem value="In transit">In transit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Periodicidad</Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editPeriodicity === "Daily"}
                    onCheckedChange={(checked) => {
                      setEditPeriodicity(checked ? "Daily" : "");
                      if (!checked) {
                        setEditDailyDetails({ diasHabiles: false, festivos: false });
                      }
                    }}
                  />
                  <span className="text-sm">Daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editPeriodicity === "Weekly"}
                    onCheckedChange={(checked) => {
                      setEditPeriodicity(checked ? "Weekly" : "");
                      if (!checked) {
                        setEditWeeklyDetails({ acumulado: false, porRango: false });
                      }
                    }}
                  />
                  <span className="text-sm">Weekly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editPeriodicity === "Monthly"}
                    onCheckedChange={(checked) => setEditPeriodicity(checked ? "Monthly" : "")}
                  />
                  <span className="text-sm">Monthly</span>
                </div>
              </div>
            </div>

            {editPeriodicity === "Daily" && (
              <div className="grid gap-2">
                <Label>Detalle</Label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editDailyDetails.diasHabiles}
                      onCheckedChange={(checked) =>
                        setEditDailyDetails((prev) => ({ ...prev, diasHabiles: checked }))
                      }
                    />
                    <span className="text-sm">Días hábiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editDailyDetails.festivos}
                      onCheckedChange={(checked) =>
                        setEditDailyDetails((prev) => ({ ...prev, festivos: checked }))
                      }
                    />
                    <span className="text-sm">Festivos</span>
                  </div>
                </div>
              </div>
            )}

            {editPeriodicity === "Weekly" && (
              <div className="grid gap-2">
                <Label>Detalle</Label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editWeeklyDetails.acumulado}
                      onCheckedChange={(checked) =>
                        setEditWeeklyDetails((prev) => ({ ...prev, acumulado: checked }))
                      }
                    />
                    <span className="text-sm">Acumulado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editWeeklyDetails.porRango}
                      onCheckedChange={(checked) =>
                        setEditWeeklyDetails((prev) => ({ ...prev, porRango: checked }))
                      }
                    />
                    <span className="text-sm">Por rango</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="edit-ingesta">Ingesta</Label>
              <Select value={editIngestaSource} onValueChange={setEditIngestaSource}>
                <SelectTrigger className="w-full border-[#DDDDDD]">
                  <SelectValue placeholder="Seleccionar fuente de ingesta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="B2B Web">B2B Web</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="App">App</SelectItem>
                  <SelectItem value="Teamcorp">Teamcorp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Variables de configuración</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditIngestaVariables([...editIngestaVariables, { key: "", value: "" }])
                  }
                  className="text-xs bg-transparent"
                >
                  + Agregar variable
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {editIngestaVariables.map((variable, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Nombre (ej: EMAIL, API_URL)"
                      value={variable.key}
                      onChange={(e) => {
                        const newVariables = [...editIngestaVariables];
                        newVariables[index].key = e.target.value;
                        setEditIngestaVariables(newVariables);
                      }}
                      className="border-[#DDDDDD] flex-1 font-mono text-sm"
                    />
                    <Input
                      placeholder="Valor"
                      value={variable.value}
                      onChange={(e) => {
                        const newVariables = [...editIngestaVariables];
                        newVariables[index].value = e.target.value;
                        setEditIngestaVariables(newVariables);
                      }}
                      className="border-[#DDDDDD] flex-1"
                    />
                    {editIngestaVariables.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newVariables = editIngestaVariables.filter((_, i) => i !== index);
                          setEditIngestaVariables(newVariables);
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

            <div className="grid gap-2">
              <Label htmlFor="edit-stakeholder">Stakeholder</Label>
              <Select value={editStakeholder} onValueChange={setEditStakeholder}>
                <SelectTrigger className="w-full border-[#DDDDDD]">
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Juan Pérez">Juan Pérez</SelectItem>
                  <SelectItem value="María García">María García</SelectItem>
                  <SelectItem value="Carlos Rodríguez">Carlos Rodríguez</SelectItem>
                  <SelectItem value="Ana Martínez">Ana Martínez</SelectItem>
                  <SelectItem value="Luis Fernández">Luis Fernández</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-file-attachment">Adjunto (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-file-attachment"
                  type="file"
                  onChange={(e) => setEditAttachedFile(e.target.files?.[0] || null)}
                  className="border-[#DDDDDD]"
                />
                {editAttachedFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditAttachedFile(null)}
                    className="text-red-600"
                  >
                    Eliminar
                  </Button>
                )}
              </div>
              {editAttachedFile && (
                <p className="text-xs text-gray-600">
                  Archivo seleccionado: {editAttachedFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveConfig}
              style={{ backgroundColor: "#CBE71E", color: "#141414" }}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
