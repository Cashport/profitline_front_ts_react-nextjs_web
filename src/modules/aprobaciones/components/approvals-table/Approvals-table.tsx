"use client";

import { Eye, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";

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

interface ApprovalsTableProps {
  approvals: Approval[];
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onSelectApproval: (approval: Approval) => void;
  onSort: (column: string) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

const approvalTypeLabels: Record<ApprovalType, string> = {
  "creacion-nota": "Creacion de Nota",
  "cupo-credito": "Cupo de Credito",
  "creacion-cliente": "Creacion Cliente",
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const calculateDaysColor = (days: number) => {
  if (days <= 2) return "text-cashport-black";
  if (days <= 5) return "text-orange-600";
  return "text-red-600";
};

export default function ApprovalsTable({
  approvals,
  selectedIds,
  onSelectIds,
  onSelectApproval,
  onSort,
  isAllSelected,
  isIndeterminate
}: ApprovalsTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectIds(approvals.map((approval) => approval.id));
    } else {
      onSelectIds([]);
    }
  };

  const handleToggleSelect = (approvalId: string) => {
    onSelectIds(
      selectedIds.includes(approvalId)
        ? selectedIds.filter((id) => id !== approvalId)
        : [...selectedIds, approvalId]
    );
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-bold text-black w-12">
                  <Checkbox
                    checked={isIndeterminate ? "indeterminate" : isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-bold text-black">
                  <button
                    onClick={() => onSort("id")}
                    className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                  >
                    ID
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 font-bold text-black">
                  <button
                    onClick={() => onSort("type")}
                    className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                  >
                    Tipo de Aprobacion
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 font-bold text-black">
                  <button
                    onClick={() => onSort("client")}
                    className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                  >
                    Cliente
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 font-bold text-black">
                  <button
                    onClick={() => onSort("date")}
                    className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                  >
                    Fecha
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-center p-4 font-bold text-black">
                  <button
                    onClick={() => onSort("daysWaiting")}
                    className="flex items-center justify-center gap-1 hover:text-gray-600 transition-colors w-full"
                  >
                    Dias Pendiente
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 font-bold text-black">
                  <button
                    onClick={() => onSort("status")}
                    className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                  >
                    Estado
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => {
                const statusData = statusConfig[approval.status];

                return (
                  <tr
                    key={approval.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(approval.id)}
                        onCheckedChange={() => handleToggleSelect(approval.id)}
                      />
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => onSelectApproval(approval)}
                        className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                      >
                        {approval.id}
                      </button>
                    </td>
                    <td className="p-4 text-gray-700">{approvalTypeLabels[approval.type]}</td>
                    <td className="p-4 text-gray-700 max-w-64">
                      <span className="truncate" title={approval.client}>
                        {approval.client}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">
                      <span className="text-sm">{formatDate(approval.date)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`font-semibold ${calculateDaysColor(approval.daysWaiting)}`}
                      >
                        {approval.daysWaiting}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={`${statusData.textColor}`}
                        style={{ backgroundColor: statusData.color }}
                      >
                        {statusData.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-md border-gray-300 hover:bg-gray-100 bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApproval(approval);
                        }}
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {approvals.map((approval) => {
          const statusData = statusConfig[approval.status];

          return (
            <div
              key={approval.id}
              className="rounded-lg border bg-white shadow-sm overflow-hidden"
              style={{ borderLeftWidth: "4px", borderLeftColor: statusData.color }}
            >
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">
                      {approvalTypeLabels[approval.type]}
                    </p>
                    <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                      {approval.daysWaiting}d
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{approval.client}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-md border-gray-300 hover:bg-gray-100 bg-transparent flex-shrink-0"
                  onClick={() => onSelectApproval(approval)}
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
