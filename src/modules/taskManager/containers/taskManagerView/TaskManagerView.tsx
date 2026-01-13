"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getTasks } from "@/services/tasks/tasks";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { Card, CardContent } from "@/modules/chat/ui/card";
import StatusTab from "@/modules/taskManager/components/statusTab/StatusTab";
import TasksTable, {
  ITask,
  SortKey,
  SortDirection
} from "@/modules/taskManager/components/tasksTable/TasksTable";
import UiSearchInput from "@/components/ui/search-input";
import FiltersTasks, {
  ISelectFilterTasks
} from "@/components/atoms/Filters/FiltersTasks/FiltersTasks";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { FilterState, mockTasks } from "../../lib/mockData";
import { ModalGenerateActionTaskManager } from "../../components/modalGenerateActionTaskManager/ModalGenerateActionTaskManager";
import {
  ModalTaskDetail,
  InvoiceData,
  mockTaskDetail
} from "../../components/modalTaskDetail/ModalTaskDetail";

import "@/modules/aprobaciones/styles/approvalsStyles.css";

export const TaskManagerView: React.FC = () => {
  // States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState({
    selected: 0
  });
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

  const [selectedFilters, setSelectedFilters] = useState<ISelectFilterTasks>({
    statuses: [],
    taskTypes: []
  });

  const [selectedTask, setSelectedTask] = useState<InvoiceData | null>(null);

  useEffect(() => {
    const fetchTasksData = async () => {
      const res = await getTasks();
      console.log("Fetched tasks data:", res);
    };

    fetchTasksData();
  }, []);

  const handleOpenModal = (selected: number) => {
    setIsModalOpen({ selected });
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

  // View task handler - opens detail modal with mock data
  const handleViewTask = (task: ITask) => {
    // For now, use mockTaskDetail but preserve the task id
    setSelectedTask({ ...mockTaskDetail, id: task.id });
    setIsModalOpen({ selected: 2 });
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
            <div className="flex gap-2">
              <UiSearchInput
                className="search"
                placeholder="Buscar tarea"
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <FiltersTasks setSelectedFilters={setSelectedFilters} />
              <GenerateActionButton
                onClick={() => {
                  setIsModalOpen({ selected: 1 });
                }}
              />
            </div>

            <PrincipalButton customStyles={{ height: "100%" }}>
              <Plus className="h-5 w-5 mr-2" />
              Nueva tarea
            </PrincipalButton>
          </div>

          <StatusTab tabs={tabItems} activeKey={activeTabKey} onChange={setActiveTabKey} />
        </CardContent>
      </Card>

      {/* Modals */}
      <ModalGenerateActionTaskManager
        isOpen={isModalOpen.selected === 1}
        onClose={() => setIsModalOpen({ selected: 0 })}
        handleOpenModal={handleOpenModal}
        selectedRows={mockTasks
          .flatMap((group) => group.tasks)
          .filter((task) => state.selectedTaskIds.includes(task.id))}
      />

      <ModalTaskDetail
        task={selectedTask}
        isOpen={isModalOpen.selected === 2}
        onClose={() => {
          setIsModalOpen({ selected: 0 });
          setSelectedTask(null);
        }}
        onUpdate={(updatedTask) => {
          console.log("Task updated:", updatedTask);
          // TODO: Implement actual update logic when API is ready
        }}
      />
    </main>
  );
};

export default TaskManagerView;
