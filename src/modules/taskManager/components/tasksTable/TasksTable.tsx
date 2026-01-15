"use client";

import { FC } from "react";
import {
  ArrowUpDown,
  Eye,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Mail,
  MessageSquare,
  Phone,
  LucideIcon
} from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import { Checkbox } from "@/modules/chat/ui/checkbox";

// Types
export interface DocumentStateConfig {
  name: string;
  color: string;
  textColor: string;
  icon: LucideIcon;
  iconColor: string;
}

export interface ITask {
  id: string;
  cliente: string;
  comprador: string;
  tipoTarea: string;
  descripcion: string;
  estado: string;
  responsable: string;
  vendedor: string;
  monto: number;
  origen: string;
  isAI: boolean;
  tab: string;
}

export type SortKey =
  | "cliente"
  | "tipoTarea"
  | "descripcion"
  | "estado"
  | "responsable"
  | "monto";
export type SortDirection = "asc" | "desc";

// Config
export const documentStateConfig: DocumentStateConfig[] = [
  {
    name: "Pendiente",
    color: "#FEF3C7",
    textColor: "text-amber-800",
    icon: Clock,
    iconColor: "text-amber-600"
  },
  {
    name: "En proceso",
    color: "#DBEAFE",
    textColor: "text-blue-800",
    icon: Clock,
    iconColor: "text-blue-600"
  },
  {
    name: "Completado",
    color: "#D1FAE5",
    textColor: "text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-600"
  },
  {
    name: "Rechazado",
    color: "#FEE2E2",
    textColor: "text-red-800",
    icon: XCircle,
    iconColor: "text-red-600"
  },
  {
    name: "En revisión",
    color: "#E0E7FF",
    textColor: "text-indigo-800",
    icon: AlertCircle,
    iconColor: "text-indigo-600"
  }
];

// Helpers
const getOrigenIcon = (origen: string) => {
  switch (origen) {
    case "email":
      return <Mail className="h-4 w-4 text-gray-500" />;
    case "chat":
      return <MessageSquare className="h-4 w-4 text-gray-500" />;
    case "phone":
      return <Phone className="h-4 w-4 text-gray-500" />;
    default:
      return <Mail className="h-4 w-4 text-gray-500" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface ITasksTableProps {
  tasks: ITask[];
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onViewTask: (task: ITask) => void;
  sortConfig: { key: SortKey; direction: SortDirection } | null;
  onSort: (key: SortKey) => void;
}

const TasksTable: FC<ITasksTableProps> = ({
  tasks,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onViewTask,
  sortConfig,
  onSort
}) => {
  const isAllSelected = tasks.length > 0 && tasks.every((task) => selectedIds.includes(task.id));
  const isIndeterminate =
    tasks.some((task) => selectedIds.includes(task.id)) && !isAllSelected;

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full min-w-full">
        <thead className="bg-white border-b border-gray-200">
          <tr>
            {/* Checkbox - hidden on mobile */}
            <th className="hidden md:table-cell text-left p-4 font-bold text-black w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                ref={(el) => {
                  if (el) {
                    const inputEl = el as unknown as HTMLInputElement;
                    if ("indeterminate" in inputEl) {
                      inputEl.indeterminate = isIndeterminate;
                    }
                  }
                }}
              />
            </th>
            {/* Origen icon - hidden on mobile */}
            <th className="hidden md:table-cell text-center p-4 font-bold text-black w-20"></th>
            <th className="text-left p-2 md:p-4 font-bold text-black w-[60%] md:w-auto">
              <button
                onClick={() => onSort("cliente")}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors text-xs md:text-sm"
              >
                Cliente
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="text-left p-2 md:p-4 font-bold text-black w-[30%] md:w-auto">
              <button
                onClick={() => onSort("tipoTarea")}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors text-xs md:text-sm"
              >
                Tipo de tarea
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            {/* Descripción - hidden on mobile */}
            <th className="hidden lg:table-cell text-left p-4 font-bold text-black">
              <button
                onClick={() => onSort("descripcion")}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                Descripción
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="hidden md:table-cell p-4 font-bold text-black">
              <button
                onClick={() => onSort("estado")}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors text-xs md:text-sm"
              >
                Estado
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            {/* Usuario - hidden on mobile */}
            <td className="hidden md:table-cell text-left p-4 font-bold text-black">
              <button
                onClick={() => onSort("responsable")}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                Usuario
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </td>
            {/* Monto - hidden on mobile */}
            <th className="hidden lg:table-cell text-right p-4 font-bold text-black">
              <button
                onClick={() => onSort("monto")}
                className="flex items-center justify-end gap-1 hover:text-gray-600 transition-colors w-full"
              >
                Monto
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="p-2 md:p-4 w-[10%] md:w-16"></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const estadoConfig = documentStateConfig.find((s) => s.name === task.estado);
            const hasIncompleteInfo = !task.cliente || !task.tipoTarea || !task.responsable;

            return (
              <tr
                key={task.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  hasIncompleteInfo ? "bg-amber-50/30" : ""
                }`}
              >
                {/* Checkbox - hidden on mobile */}
                <td className="hidden md:table-cell p-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(task.id)}
                    onCheckedChange={() => onToggleSelection(task.id)}
                  />
                </td>
                {/* Origen icon - hidden on mobile */}
                <td className="hidden md:table-cell p-4 text-center">
                  <div className="flex items-center justify-center" title={task.origen}>
                    {getOrigenIcon(task.origen)}
                  </div>
                </td>
                {/* Cliente - always visible */}
                <td className="p-2 md:p-4 text-gray-900 font-medium">
                  {task.cliente || task.comprador ? (
                    <div
                      className="truncate text-xs md:text-sm max-w-[150px] md:max-w-xs"
                      title={task.cliente || task.comprador}
                    >
                      {task.cliente || task.comprador}
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-500 border-dashed font-normal text-xs"
                    >
                      Sin asignar
                    </Badge>
                  )}
                </td>
                {/* Tipo de tarea - always visible */}
                <td className="p-2 md:p-4">
                  {task.tipoTarea ? (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200 truncate block max-w-[100px] md:max-w-none text-xs"
                      title={task.tipoTarea}
                    >
                      {task.tipoTarea}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-500 border-dashed text-xs"
                    >
                      Sin asignar
                    </Badge>
                  )}
                </td>
                {/* Descripción - hidden on mobile */}
                <td className="hidden lg:table-cell p-4 text-gray-700 max-w-md">
                  {task.descripcion ? (
                    <div className="truncate" title={task.descripcion}>
                      {task.descripcion}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Sin descripción</span>
                  )}
                </td>
                <td className="hidden md:table-cell p-4">
                  <Badge
                    className={`${estadoConfig?.textColor || "text-gray-700"} font-medium px-2 md:px-3 py-1 flex items-center gap-1.5 w-fit whitespace-nowrap text-xs`}
                    style={{ backgroundColor: estadoConfig?.color || "#F3F4F6" }}
                    title={task.estado}
                  >
                    {estadoConfig?.icon && (
                      <estadoConfig.icon className={`h-3.5 w-3.5 ${estadoConfig.iconColor}`} />
                    )}
                    {task.estado}
                  </Badge>
                </td>
                {/* Usuario - hidden on mobile */}
                <td className="hidden md:table-cell p-4 max-w-xs">
                  {task.isAI ? (
                    <Badge
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 font-medium px-3 py-1 flex items-center gap-1.5 whitespace-nowrap w-fit"
                      title="Cashport AI"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Cashport AI
                    </Badge>
                  ) : task.responsable || task.vendedor ? (
                    <div className="truncate" title={task.responsable || task.vendedor}>
                      <span className="text-gray-900 font-medium">
                        {task.responsable || task.vendedor}
                      </span>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-500 border-dashed font-normal"
                    >
                      Sin asignar
                    </Badge>
                  )}
                </td>
                {/* Monto - hidden on mobile */}
                <td className="hidden lg:table-cell p-4 text-right text-cashport-black font-medium whitespace-nowrap">
                  {task.monto ? formatCurrency(task.monto) : "-"}
                </td>
                <td className="p-2 md:p-4 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewTask(task);
                    }}
                    title="Ver detalles"
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
  );
};

export default TasksTable;
