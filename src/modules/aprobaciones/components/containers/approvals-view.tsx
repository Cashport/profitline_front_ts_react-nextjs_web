"use client";

import { useState } from "react";
import { SlidersHorizontal, ListFilter } from "lucide-react";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import OptimizedSearchComponent from "@/components/atoms/inputs/OptimizedSearchComponent/OptimizedSearchComponent";
import { Button } from "@/modules/chat/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";
import ApprovalDetailModal from "@/modules/aprobaciones/components/approval-detail-modal";
import ApprovalsTable from "../approvals-table/approvals-table";

import "@/modules/chat/styles/chatStyles.css";
import "@/modules/aprobaciones/styles/approvalsStyles.css";

type ApprovalStatus = "pendiente" | "aprobado" | "rechazado" | "en-espera";
type ApprovalType = "creacion-nota" | "cupo-credito" | "creacion-cliente" | "orden-compra";

interface ApprovalApprover {
  name: string;
  step: number;
  status: ApprovalStatus;
  date?: string;
  time?: string;
  comment?: string;
}

interface Approval {
  id: string;
  type: ApprovalType;
  client: string;
  date: string;
  daysWaiting: number;
  status: ApprovalStatus;
  requestedBy: string;
  otherApprovers: ApprovalApprover[];
  comment: string;
  attachments: string[];
  detailLink: string;
  details: {
    amount?: string;
    items?: string[];
    currentLimit?: string;
    requestedLimit?: string;
    clientInfo?: string;
  };
}

// Mock data
const mockApprovals: Approval[] = [
  {
    id: "APR-001",
    type: "orden-compra",
    client: "Acme Corporation",
    date: "2025-01-15",
    daysWaiting: 5,
    status: "pendiente",
    requestedBy: "Juan Pérez",
    otherApprovers: [
      {
        name: "María González",
        step: 1,
        status: "aprobado",
        date: "2025-01-16",
        time: "10:30 a.m.",
        comment: "Aprobado, presupuesto disponible"
      },
      {
        name: "Carlos López",
        step: 2,
        status: "pendiente"
      },
      {
        name: "Ana Martínez",
        step: 2,
        status: "pendiente"
      }
    ],
    comment: "Orden urgente para proyecto Q1",
    attachments: ["cotizacion.pdf", "especificaciones.docx"],
    detailLink: "/documentos/OC-12345",
    details: {
      amount: "$25,000.00",
      items: ["Equipos de oficina", "Software licencias", "Mobiliario"]
    }
  },
  {
    id: "APR-002",
    type: "cupo-credito",
    client: "Tech Solutions SA",
    date: "2025-01-17",
    daysWaiting: 3,
    status: "pendiente",
    requestedBy: "Ana Martínez",
    otherApprovers: [
      {
        name: "Roberto Díaz",
        step: 1,
        status: "aprobado",
        date: "2025-01-18",
        time: "2:15 p.m.",
        comment: "Cliente confiable, aprobado"
      },
      {
        name: "Patricia Silva",
        step: 2,
        status: "pendiente"
      }
    ],
    comment: "Cliente con historial positivo solicita aumento",
    attachments: ["estados-financieros.pdf"],
    detailLink: "/clientes/CLI-789/credito",
    details: {
      currentLimit: "$50,000.00",
      requestedLimit: "$100,000.00"
    }
  },
  {
    id: "APR-003",
    type: "creacion-cliente",
    client: "Innovate Industries",
    date: "2025-01-18",
    daysWaiting: 2,
    status: "pendiente",
    requestedBy: "Luis Ramírez",
    otherApprovers: [
      {
        name: "Sandra Torres",
        step: 1,
        status: "pendiente"
      }
    ],
    comment: "Nuevo cliente referido por partner estratégico",
    attachments: ["rut.pdf", "camara-comercio.pdf"],
    detailLink: "/clientes/nuevo/CLI-NEW-456",
    details: {
      clientInfo: "Empresa de tecnología con 5 años en el mercado"
    }
  },
  {
    id: "APR-004",
    type: "creacion-nota",
    client: "Global Traders Ltd",
    date: "2025-01-19",
    daysWaiting: 1,
    status: "en-espera",
    requestedBy: "Patricia Silva",
    otherApprovers: [
      {
        name: "Miguel Ángel Ruiz",
        step: 1,
        status: "aprobado",
        date: "2025-01-19",
        time: "11:45 a.m.",
        comment: "Conforme con la devolución"
      },
      {
        name: "Laura Fernández",
        step: 2,
        status: "pendiente"
      },
      {
        name: "Jorge Medina",
        step: 3,
        status: "pendiente"
      }
    ],
    comment: "Nota de crédito por devolución parcial",
    attachments: ["factura-original.pdf", "acta-devolucion.pdf"],
    detailLink: "/notas-credito/NC-9876",
    details: {
      amount: "$5,400.00"
    }
  },
  {
    id: "APR-005",
    type: "orden-compra",
    client: "Manufacturing Pro",
    date: "2025-01-10",
    daysWaiting: 10,
    status: "aprobado",
    requestedBy: "Fernando Castro",
    otherApprovers: [
      {
        name: "Diana Morales",
        step: 1,
        status: "aprobado",
        date: "2025-01-11",
        time: "9:20 a.m.",
        comment: "Aprobado por urgencia"
      },
      {
        name: "Ricardo Vargas",
        step: 2,
        status: "aprobado",
        date: "2025-01-12",
        time: "3:45 p.m.",
        comment: "Confirmado"
      }
    ],
    comment: "Aprobado por urgencia de producción",
    attachments: ["oc-detalle.pdf"],
    detailLink: "/documentos/OC-11234",
    details: {
      amount: "$15,800.00",
      items: ["Materia prima", "Insumos"]
    }
  },
  {
    id: "APR-006",
    type: "cupo-credito",
    client: "Small Business Inc",
    date: "2025-01-14",
    daysWaiting: 6,
    status: "rechazado",
    requestedBy: "Gabriela Sánchez",
    otherApprovers: [
      {
        name: "Jorge Medina",
        step: 1,
        status: "rechazado",
        date: "2025-01-15",
        time: "4:30 p.m.",
        comment: "Historial de pagos irregular, no se recomienda"
      }
    ],
    comment: "Rechazado por historial de pagos irregular",
    attachments: ["analisis-credito.pdf"],
    detailLink: "/clientes/CLI-456/credito",
    details: {
      currentLimit: "$10,000.00",
      requestedLimit: "$30,000.00"
    }
  }
];

const approvalTypeLabels: Record<ApprovalType, string> = {
  "creacion-nota": "Creación de Nota",
  "cupo-credito": "Cupo de Crédito",
  "creacion-cliente": "Creación Cliente",
  "orden-compra": "Orden de Compra"
};

const statusConfig: Record<ApprovalStatus, { label: string; color: string; textColor: string }> = {
  pendiente: {
    label: "Pendiente",
    color: "#FFC107",
    textColor: "text-black"
  },
  aprobado: {
    label: "Aprobado",
    color: "#4CAF50",
    textColor: "text-white"
  },
  rechazado: {
    label: "Rechazado",
    color: "#E53935",
    textColor: "text-white"
  },
  "en-espera": {
    label: "En Espera",
    color: "#2196F3",
    textColor: "text-white"
  }
};

export default function ApprovalsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ApprovalStatus[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ApprovalType[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredApprovals = mockApprovals.filter((approval) => {
    const matchesSearch =
      approval.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(approval.status);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(approval.type);

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="bg-background rounded-lg">
      <main className="p-6">
        <div className="mx-auto">
          <div className="space-y-4">
            {/* Responsive flex-col on mobile, flex-row on md+ */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <OptimizedSearchComponent onSearch={setSearchQuery} title="Buscar" />

              <div className="hidden md:flex items-center gap-2">
                <GenerateActionButton
                  onClick={() => {}}
                  disabled={selectedIds.length === 0}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent !font-semibold"
                      style={{ height: "3rem" }}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Estados
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {Object.keys(statusConfig).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => {
                          setSelectedStatuses((prev) =>
                            prev.includes(status as ApprovalStatus)
                              ? prev.filter((s) => s !== status)
                              : [...prev, status as ApprovalStatus]
                          );
                        }}
                      >
                        {statusConfig[status as ApprovalStatus].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent !font-semibold"
                      style={{ height: "3rem" }}
                    >
                      <ListFilter className="h-4 w-4" />
                      Tipos
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {Object.keys(approvalTypeLabels).map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => {
                          setSelectedTypes((prev) =>
                            prev.includes(type as ApprovalType)
                              ? prev.filter((t) => t !== type)
                              : [...prev, type as ApprovalType]
                          );
                        }}
                      >
                        {approvalTypeLabels[type as ApprovalType]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <ApprovalsTable
              approvals={filteredApprovals}
              selectedIds={selectedIds}
              onSelectIds={setSelectedIds}
              onSelectApproval={setSelectedApproval}
            />
          </div>
        </div>
      </main>

      <ApprovalDetailModal
        approval={selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onApprove={(id) => {
          console.log("Aprobar:", id);
          setSelectedApproval(null);
        }}
        onReject={(id) => {
          console.log("Rechazar:", id);
          setSelectedApproval(null);
        }}
      />
    </div>
  );
}
