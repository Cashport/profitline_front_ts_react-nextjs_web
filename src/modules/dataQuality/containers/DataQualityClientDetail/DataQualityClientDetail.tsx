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
import { Button } from "@/modules/chat/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { ModalDataIntake, DataIntakeFormData } from "../../components/modal-data-intake";
import { ClientDetailInfo } from "../../components/ClientDetailInfo";

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
  const [isModalDataIntakeOpen, setIsModalDataIntakeOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<Partial<DataIntakeFormData> | undefined>(
    undefined
  );

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
    // Determine fileType from clientConfig.fileTypes array (take first one or default)
    const primaryFileType = clientConfig.fileTypes[0] || "";

    const initialData: Partial<DataIntakeFormData> = {
      clientName: clientName,
      fileType: primaryFileType,
      periodicity: clientConfig.periodicity as "Daily" | "Weekly" | "Monthly",
      dailyDetails: clientInfo.dailyDetails,
      weeklyDetails: clientInfo.weeklyDetails,
      ingestaSource: clientInfo.ingestaSource,
      stakeholder: clientInfo.stakeholder,
      attachedFile: null,
      ingestaVariables:
        clientInfo.ingestaVariables.length > 0
          ? [...clientInfo.ingestaVariables]
          : [{ key: "", value: "" }]
    };

    setModalInitialData(initialData);
    setIsModalDataIntakeOpen(true);
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
      <main>
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

            <ClientDetailInfo clientConfig={clientConfig} clientInfo={clientInfo} />

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

      <ModalDataIntake
        mode="edit"
        open={isModalDataIntakeOpen}
        onOpenChange={setIsModalDataIntakeOpen}
        initialData={modalInitialData}
        onSuccess={() => {
          console.log("[v0] Configuration saved successfully");
          // TODO: Refresh client data or show success notification
        }}
      />
    </div>
  );
}
