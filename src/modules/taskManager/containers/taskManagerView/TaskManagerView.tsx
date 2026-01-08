"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Building,
  User,
  MoreHorizontal,
  DollarSign,
  ShoppingCart,
  Users,
  UserCheck,
  Plus
} from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { Input } from "@/modules/chat/ui/input";

import StatusTab from "@/modules/taskManager/components/statusTab/StatusTab";
import TasksTable, {
  ITask,
  SortKey,
  SortDirection,
  documentStateConfig
} from "@/modules/taskManager/components/tasksTable/TasksTable";

import "@/modules/aprobaciones/styles/approvalsStyles.css";
import { FilterState, mockTasks } from "../../lib/mockData";

// Get all tasks from all groups
const getAllTasks = (): ITask[] => {
  return mockTasks.flatMap((group) => group.tasks);
};

export const TaskManagerView: React.FC = () => {
  // States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showGroupedFiltersDropdown, setShowGroupedFiltersDropdown] = useState<boolean>(false);
  const [showNewApprovalForm, setShowNewApprovalForm] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>("1");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(
    null
  );

  const [state, setState] = useState<FilterState>({
    filterState: null,
    filterComprador: null,
    filterVendedor: null,
    selectedTaskIds: []
  });

  // Filter handlers
  const setFilter = (filterState: string | null) => {
    setState((prev) => ({ ...prev, filterState }));
  };

  const handleStateFilter = (stateName: string) => {
    setState((prev) => ({
      ...prev,
      filterState: prev.filterState === stateName ? null : stateName
    }));
  };

  const setCompradorFilter = (filterComprador: string | null) => {
    setState((prev) => ({ ...prev, filterComprador }));
  };

  const handleCompradorFilter = (comprador: string) => {
    setState((prev) => ({
      ...prev,
      filterComprador: prev.filterComprador === comprador ? null : comprador
    }));
  };

  const setVendedorFilter = (filterVendedor: string | null) => {
    setState((prev) => ({ ...prev, filterVendedor }));
  };

  const handleVendedorFilter = (vendedor: string) => {
    setState((prev) => ({
      ...prev,
      filterVendedor: prev.filterVendedor === vendedor ? null : vendedor
    }));
  };

  // Selection handlers
  const toggleTaskSelection = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      selectedTaskIds: prev.selectedTaskIds.includes(taskId)
        ? prev.selectedTaskIds.filter((id) => id !== taskId)
        : [...prev.selectedTaskIds, taskId]
    }));
  };

  // Sort handler
  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  // View task handler
  const handleViewTask = (task: ITask) => {
    console.log("View task:", task);
  };

  // Handle select all for current tab
  const handleSelectAll = (tasks: ITask[], checked: boolean) => {
    if (checked) {
      const allIds = tasks.map((task) => task.id);
      setState((prev) => ({
        ...prev,
        selectedTaskIds: Array.from(new Set([...prev.selectedTaskIds, ...allIds]))
      }));
    } else {
      const taskIds = tasks.map((task) => task.id);
      setState((prev) => ({
        ...prev,
        selectedTaskIds: prev.selectedTaskIds.filter((id) => !taskIds.includes(id))
      }));
    }
  };

  // Filter and sort tasks for a group
  const getFilteredAndSortedTasks = (tasks: ITask[]): ITask[] => {
    let filtered = tasks.filter((task) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          task.cliente?.toLowerCase().includes(searchLower) ||
          task.tipoTarea?.toLowerCase().includes(searchLower) ||
          task.descripcion?.toLowerCase().includes(searchLower) ||
          task.responsable?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // State filter
      if (state.filterState && task.estado !== state.filterState) return false;

      // Comprador filter
      if (state.filterComprador && task.comprador !== state.filterComprador) return false;

      // Vendedor filter
      if (state.filterVendedor && task.vendedor !== state.filterVendedor) return false;

      return true;
    });

    // Sort
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";

        if (sortConfig.key === "monto") {
          return sortConfig.direction === "asc"
            ? (a.monto || 0) - (b.monto || 0)
            : (b.monto || 0) - (a.monto || 0);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  // Unique values for filters (from all tasks)
  const allTasks = getAllTasks();

  const uniqueCompradores = useMemo(() => {
    const compradores = allTasks
      .map((task) => task.comprador)
      .filter((c): c is string => !!c && c.trim() !== "");
    return Array.from(new Set(compradores));
  }, []);

  const uniqueVendedores = useMemo(() => {
    const vendedores = allTasks
      .map((task) => task.vendedor)
      .filter((v): v is string => !!v && v.trim() !== "");
    return Array.from(new Set(vendedores));
  }, []);

  // Task counts by state
  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    documentStateConfig.forEach((config) => {
      counts[config.name] = allTasks.filter((task) => task.estado === config.name).length;
    });
    return counts;
  }, []);

  // Build tabs from mockTasks
  const tabItems = mockTasks.map((group) => {
    const filteredTasks = getFilteredAndSortedTasks(group.tasks);

    return {
      key: group.status_id.toString(),
      label: group.status,
      count: group.count,
      children: (
        <TasksTable
          tasks={filteredTasks}
          selectedIds={state.selectedTaskIds}
          onToggleSelection={toggleTaskSelection}
          onSelectAll={(checked) => handleSelectAll(filteredTasks, checked)}
          onViewTask={handleViewTask}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      )
    };
  });

  return (
    <main>
      <Card className="bg-cashport-white border-0 shadow-sm">
        <CardContent className="px-6 pt-2 pb-4">
          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar tarea"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10 w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-gray-300 focus:ring-0"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-cashport-white whitespace-nowrap"
                    onClick={() => setShowGroupedFiltersDropdown(!showGroupedFiltersDropdown)}
                  >
                    Filtrar
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>

                  {showGroupedFiltersDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-96 bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg z-10">
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                            Estado
                          </label>
                          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                            <button
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                                state.filterState === null
                                  ? "bg-cashport-green text-cashport-black font-medium"
                                  : "text-cashport-black"
                              }`}
                              onClick={() => {
                                setFilter(null);
                              }}
                            >
                              Todos los estados
                            </button>

                            {documentStateConfig.map((stateConfig) => {
                              const count = taskCounts[stateConfig.name] || 0;
                              return (
                                <button
                                  key={stateConfig.name}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                                    state.filterState === stateConfig.name
                                      ? "bg-cashport-green text-cashport-black font-medium"
                                      : "text-cashport-black"
                                  }`}
                                  onClick={() => {
                                    handleStateFilter(stateConfig.name);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: stateConfig.color }}
                                      ></div>
                                      <span>{stateConfig.name}</span>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="bg-cashport-gray-lighter text-cashport-black"
                                    >
                                      {count}
                                    </Badge>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                            <Building className="h-3 w-3 inline mr-1" />
                            Cliente
                          </label>
                          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                            <button
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                                state.filterComprador === null
                                  ? "bg-cashport-green text-cashport-black font-medium"
                                  : "text-cashport-black"
                              }`}
                              onClick={() => {
                                setCompradorFilter(null);
                              }}
                            >
                              Todos los clientes
                            </button>

                            {uniqueCompradores.map((comprador) => (
                              <button
                                key={comprador}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                                  state.filterComprador === comprador
                                    ? "bg-cashport-green text-cashport-black font-medium"
                                    : "text-cashport-black"
                                }`}
                                onClick={() => {
                                  handleCompradorFilter(comprador);
                                }}
                              >
                                <div className="truncate" title={comprador}>
                                  {comprador}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                            <User className="h-3 w-3 inline mr-1" />
                            Responsable
                          </label>
                          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                            <button
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                                state.filterVendedor === null
                                  ? "bg-cashport-green text-cashport-black font-medium"
                                  : "text-cashport-black"
                              }`}
                              onClick={() => {
                                setVendedorFilter(null);
                              }}
                            >
                              Todos los responsables
                            </button>

                            {uniqueVendedores.map((vendedor) => (
                              <button
                                key={vendedor}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                                  state.filterVendedor === vendedor
                                    ? "bg-cashport-green text-cashport-black font-medium"
                                    : "text-cashport-black"
                                }`}
                                onClick={() => {
                                  handleVendedorFilter(vendedor);
                                }}
                              >
                                <div className="truncate" title={vendedor}>
                                  {vendedor}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowGroupedFiltersDropdown(false)}
                            className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter"
                          >
                            Cerrar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-700 hover:bg-gray-100 bg-gray-50 whitespace-nowrap"
                    >
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Generar acción
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem
                      onClick={() => console.log("Aplicación de pagos")}
                      className="whitespace-nowrap pr-6"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Aplicación de pagos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => console.log("Orden de compra")}
                      className="whitespace-nowrap pr-6"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Orden de compra
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => console.log("Asignar cliente")}
                      className="whitespace-nowrap pr-6"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Asignar cliente
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => console.log("Asignar responsable")}
                      className="whitespace-nowrap pr-6"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Asignar responsable
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Button
              className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black font-semibold text-base px-6 py-5 whitespace-nowrap w-full sm:w-auto"
              onClick={() => setShowNewApprovalForm(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Nueva tarea</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          </div>

          <StatusTab tabs={tabItems} activeKey={activeTabKey} onChange={setActiveTabKey} />
        </CardContent>
      </Card>
    </main>
  );
};

export default TaskManagerView;
