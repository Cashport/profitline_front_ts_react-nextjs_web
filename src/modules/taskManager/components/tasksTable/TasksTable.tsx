"use client";

import { FC } from "react";
import {
  ArrowUpDown,
  Eye,
  Sparkles
} from "lucide-react";
import { Spin } from "antd";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import { TaskActionsDropdown } from "../taskActionsDropdown/TaskActionsDropdown";
import { ITask } from "@/types/tasks/ITasks";

// Types
export type SortKey =
  | "client_name"
  | "task_type"
  | "description"
  | "status"
  | "user_name"
  | "amount";
export type SortDirection = "asc" | "desc";

// Helpers
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
  selectedIds: number[];
  onToggleSelection: (id: number | null) => void;
  onSelectAll: (checked: boolean) => void;
  onViewTask: (task: ITask) => void;
  sortConfig: { key: SortKey; direction: SortDirection } | null;
  onSort: (key: SortKey) => void;
  isLoading?: boolean;
}

const TasksTable: FC<ITasksTableProps> = ({
  tasks,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onViewTask,
  sortConfig,
  onSort,
  isLoading = false
}) => {
  const isAllSelected =
    tasks.length > 0 && tasks.every((task) => task.id !== null && selectedIds.includes(task.id));
  const isIndeterminate =
    tasks.some((task) => task.id !== null && selectedIds.includes(task.id)) && !isAllSelected;

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
          <Spin size="large" />
        </div>
      )}
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
            <th className="text-left p-2 md:p-4 font-bold text-black w-[60%] md:w-auto">
              <button
                onClick={() => onSort("client_name")}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors text-xs md:text-sm"
              >
                Cliente
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="text-left p-2 md:p-4 font-bold text-black w-[30%] md:w-auto">
              <button
                onClick={() => onSort("task_type")}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors text-xs md:text-sm"
              >
                Tipo de tarea
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            {/* Descripción - hidden on mobile */}
            <th className="hidden lg:table-cell text-left p-4 font-bold text-black">
              <button
                onClick={() => onSort("description")}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                Descripción
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            <th className="hidden md:table-cell p-4 font-bold text-black">
              <button
                onClick={() => onSort("status")}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors text-xs md:text-sm"
              >
                Estado
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </th>
            {/* Usuario - hidden on mobile */}
            <td className="hidden md:table-cell text-left p-4 font-bold text-black">
              <button
                onClick={() => onSort("user_name")}
                className="flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                Usuario
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </td>
            {/* Monto - hidden on mobile */}
            <th className="hidden lg:table-cell text-right p-4 font-bold text-black">
              <button
                onClick={() => onSort("amount")}
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
            const hasIncompleteInfo = !task.client_name || !task.task_type || !task.user_name;

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
                    checked={task.id !== null && selectedIds.includes(task.id)}
                    onCheckedChange={() => onToggleSelection(task.id)}
                  />
                </td>
                {/* Cliente - always visible */}
                <td className="p-2 md:p-4 text-gray-900 font-medium">
                  {task.client_name ? (
                    <div
                      className="truncate text-xs md:text-sm max-w-[150px] md:max-w-xs"
                      title={task.client_name}
                    >
                      {task.client_name}
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
                  {task.task_type ? (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200 truncate block max-w-[100px] md:max-w-none text-xs"
                      title={task.task_type}
                    >
                      {task.task_type}
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
                  {task.description ? (
                    <div className="truncate" title={task.description}>
                      {task.description}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Sin descripción</span>
                  )}
                </td>
                {/* Estado */}
                <td className="hidden md:table-cell p-4">
                  <Badge
                    className="font-medium px-2 md:px-3 py-1 flex items-center w-fit whitespace-nowrap text-xs"
                    style={{
                      backgroundColor: task.status?.backgroundColor || '#F3F4F6',
                      color: task.status?.color || '#374151'
                    }}
                    title={task.status?.name}
                  >
                    {task.status?.name}
                  </Badge>
                </td>
                {/* Usuario - hidden on mobile */}
                <td className="hidden md:table-cell p-4 max-w-xs">
                  {task.is_ai ? (
                    <Badge
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 font-medium px-3 py-1 flex items-center gap-1.5 whitespace-nowrap w-fit"
                      title="Cashport AI"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Cashport AI
                    </Badge>
                  ) : task.user_name ? (
                    <div className="truncate" title={task.user_name}>
                      <span className="text-gray-900 font-medium">{task.user_name}</span>
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
                  {task.amount ? formatCurrency(task.amount) : "-"}
                </td>
                <td className="p-2 md:p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TaskActionsDropdown task={task} />
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
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default TasksTable;
