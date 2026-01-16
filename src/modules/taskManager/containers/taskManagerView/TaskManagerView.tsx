"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import useSWR from "swr";
import { getTasksByStatus, getTaskTabs } from "@/services/tasks/tasks";
import { ITask } from "@/types/tasks/ITasks";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { Card, CardContent } from "@/modules/chat/ui/card";
import StatusTab from "@/modules/taskManager/components/statusTab/StatusTab";
import TasksTable, {
  SortKey,
  SortDirection
} from "@/modules/taskManager/components/tasksTable/TasksTable";
import UiSearchInput from "@/components/ui/search-input";
import Pagination from "@/components/ui/pagination";
import FiltersTasks, {
  ISelectFilterTasks
} from "@/components/atoms/Filters/FiltersTasks/FiltersTasks";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { mockTasks } from "../../lib/mockData";
import { ModalGenerateActionTaskManager } from "../../components/modalGenerateActionTaskManager/ModalGenerateActionTaskManager";
import { ModalTaskDetail } from "../../components/modalTaskDetail/ModalTaskDetail";

interface FilterState {
  filterState: string | null;
  filterComprador: string | null;
  filterVendedor: string | null;
  selectedTaskIds: number[];
}

export const TaskManagerView: React.FC = () => {
  // States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState({
    selected: 0
  });
  const [activeTabKey, setActiveTabKey] = useState<string>();
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

  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);

  // Tasks by status - stores fetched tasks indexed by status ID
  const [tasksByStatus, setTasksByStatus] = useState<Record<string, ITask[]>>({});

  // Pagination state per tab
  interface PaginationInfo {
    page: number;
    total: number;
    limit: number;
  }
  const [paginationByStatus, setPaginationByStatus] = useState<Record<string, PaginationInfo>>({});
  const [isLoadingPagination, setIsLoadingPagination] = useState(false);

  // SWR for tabs data
  const {
    data: tabsData,
    isLoading: isLoadingTabs,
    mutate: mutateTabs
  } = useSWR("taskTabs", getTaskTabs, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000
  });

  useEffect(() => {
    if (tabsData && !isLoadingTabs) {
      // aca entonces setear el activeTabKey al primero si no esta seteado
      if (!activeTabKey && tabsData.length > 0) {
        setActiveTabKey(tabsData[0].id);
      }
    }
  }, [tabsData, isLoadingTabs]);

  useEffect(() => {
    // Clear selected rows when switching tabs
    setState((prev) => ({
      ...prev,
      selectedTaskIds: []
    }));

    // Fetch tasks for the active tab only if not already loaded
    const fetchTasksForActiveTab = async () => {
      if (activeTabKey && !tasksByStatus[activeTabKey]) {
        try {
          const response = await getTasksByStatus(activeTabKey, 1);
          const tasksArray = response?.tasks ?? [];
          setTasksByStatus((prev) => ({
            ...prev,
            [activeTabKey]: tasksArray
          }));
          setPaginationByStatus((prev) => ({
            ...prev,
            [activeTabKey]: {
              page: response?.page ?? 1,
              total: response?.total ?? 0,
              limit: response?.limit ?? 25
            }
          }));
        } catch (error) {
          console.error("Error fetching tasks for active tab:", error);
        }
      }
    };
    fetchTasksForActiveTab();
  }, [activeTabKey]);

  const handleOpenModal = (selected: number) => {
    setIsModalOpen({ selected });
  };

  // Selection handlers
  const toggleTaskSelection = (taskId: number | null) => {
    if (taskId === null) return; // Guard against null IDs
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

  // View task handler - opens detail modal
  const handleViewTask = (task: ITask) => {
    setSelectedTask(task);
    setIsModalOpen({ selected: 2 });
  };

  // Handle select all for current tab
  const handleSelectAll = (tasks: ITask[], checked: boolean) => {
    if (checked) {
      const allIds = tasks.map((task) => task.id).filter((id): id is number => id !== null);
      setState((prev) => ({
        ...prev,
        selectedTaskIds: Array.from(new Set([...prev.selectedTaskIds, ...allIds]))
      }));
    } else {
      const taskIds = tasks.map((task) => task.id).filter((id): id is number => id !== null);
      setState((prev) => ({
        ...prev,
        selectedTaskIds: prev.selectedTaskIds.filter((id) => !taskIds.includes(id))
      }));
    }
  };

  // Handle page change for pagination
  const handlePageChange = async (statusId: string, page: number) => {
    setIsLoadingPagination(true);
    try {
      const response = await getTasksByStatus(statusId, page);
      setTasksByStatus((prev) => ({
        ...prev,
        [statusId]: response?.tasks ?? []
      }));
      setPaginationByStatus((prev) => ({
        ...prev,
        [statusId]: {
          page: response?.page ?? page,
          total: response?.total ?? 0,
          limit: response?.limit ?? 25
        }
      }));
    } catch (error) {
      console.error("Error fetching page:", error);
    } finally {
      setIsLoadingPagination(false);
    }
  };

  // Reset pagination when filters/search change
  useEffect(() => {
    setPaginationByStatus({});
  }, [searchTerm, selectedFilters, sortConfig]);

  // Filter and sort tasks for a group
  const getFilteredAndSortedTasks = (tasks: ITask[]): ITask[] => {
    let filtered = tasks.filter((task) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          task.client_name?.toLowerCase().includes(searchLower) ||
          task.task_type?.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.user_name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // State filter
      if (state.filterState && task.status?.name !== state.filterState) return false;

      // Comprador filter - use client_name
      if (state.filterComprador && task.client_name !== state.filterComprador) return false;

      // Vendedor filter - skip or use user_name
      // if (state.filterVendedor && task.user_name !== state.filterVendedor) return false;

      return true;
    });

    // Sort
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        // Handle amount sorting
        if (sortConfig.key === "amount") {
          return sortConfig.direction === "asc"
            ? (a.amount || 0) - (b.amount || 0)
            : (b.amount || 0) - (a.amount || 0);
        }

        // Handle status sorting (nested property)
        if (sortConfig.key === "status") {
          const aValue = a.status?.name ?? "";
          const bValue = b.status?.name ?? "";
          if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }

        // Handle other fields with optional chaining
        const aValue = (a[sortConfig.key as keyof ITask] as any)?.toString() ?? "";
        const bValue = (b[sortConfig.key as keyof ITask] as any)?.toString() ?? "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  // Build tabs from API data
  const tabItems = tabsData?.map((tab) => {
    const apiTasks = tasksByStatus[tab.id] || [];
    const filteredTasks = getFilteredAndSortedTasks(apiTasks);
    const pagination = paginationByStatus[tab.id];

    return {
      key: tab.id,
      label: tab.status_name,
      count: tab.count,
      children: (
        <>
          <TasksTable
            tasks={filteredTasks}
            selectedIds={state.selectedTaskIds}
            onToggleSelection={toggleTaskSelection}
            onSelectAll={(checked) => handleSelectAll(filteredTasks, checked)}
            onViewTask={handleViewTask}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          {pagination && pagination.total > pagination.limit && (
            <Pagination
              currentPage={pagination.page}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={(page) => handlePageChange(tab.id, page)}
              isLoading={isLoadingPagination}
            />
          )}
        </>
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
          .filter((task) => task.id !== null && state.selectedTaskIds.includes(task.id))}
      />

      <ModalTaskDetail
        task={selectedTask}
        isOpen={isModalOpen.selected === 2}
        onClose={() => {
          setIsModalOpen({ selected: 0 });
          setSelectedTask(null);
        }}
        onUpdate={(updatedTask: ITask) => {
          console.log("Task updated:", updatedTask);
          // TODO: Implement actual update logic when API is ready
        }}
      />
    </main>
  );
};

export default TaskManagerView;
