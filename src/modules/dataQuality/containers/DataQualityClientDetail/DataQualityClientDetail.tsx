"use client";

import { useEffect, useState } from "react";

import { Edit, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/modules/chat/ui/button";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { ModalDataIntake, DataIntakeFormData } from "../../components/modal-data-intake";
import { ClientDetailInfo } from "../../components/ClientDetailInfo";
import { ClientDetailTable } from "../../components/ClientDetailTable";
import { getClientDetail } from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";

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

export default function DataQualityClientDetails() {
  const params = useParams();
  const router = useRouter();
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);

  const countryId = params.countryId as string;
  const clientId = params.clientId as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalDataIntakeOpen, setIsModalDataIntakeOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<Partial<DataIntakeFormData> | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchClientDetail = async () => {
      // TO DO - use real countryId and clientId
      const res = await getClientDetail("2", 100);
      console.log("Client detail data:", res);
    };

    fetchClientDetail();
  }, [clientId, countryId]);

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

            <ClientDetailTable files={filteredFiles} />
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
