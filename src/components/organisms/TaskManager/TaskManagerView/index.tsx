"use client";
import { useState } from "react";
import { Flex, Spin } from "antd";

import { useTasks } from "@/hooks/useTasks";
import { useDebounce } from "@/hooks/useSearch";

import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import TaskTable from "../TaskManagerTable";
import SendEmailModal from "@/components/molecules/modals/SendEmailModal";
import MakeCallModal from "@/components/molecules/modals/MakeCallModal";
import FiltersTasks, {
  ISelectFilterTasks
} from "@/components/atoms/Filters/FiltersTasks/FiltersTasks";

import { ITask } from "@/types/tasks/ITasks";

const TaskManagerView = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000);
  const [selectedRows, setSelectedRows] = useState<ITask[] | undefined>(undefined);
  const [modalSendEmailVisible, setModalSendEmailVisible] = useState(false);
  const [modalMakeCallVisible, setModalMakeCallVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<ISelectFilterTasks>({
    statuses: [],
    taskTypes: [],
    dates: []
  });
  const [customDate, setCustomDate] = useState<string>("");

  const { data, isLoading } = useTasks(selectedFilters, debouncedSearch);

  const openSendEmailModal = () => {
    setModalSendEmailVisible(true);
  };
  const openMakeCalllModal = () => {
    setModalMakeCallVisible(true);
  };

  return (
    <>
      {/* Tarjeta compartida (docs/DESIGN.md §3). */}
      <div className="cp-card flex h-full flex-col overflow-y-auto px-[18px] py-[14px]">
        <Flex gap={"1rem"} vertical>
          <Flex gap={"0.5rem"} align="center">
            <UiSearchInput
              className="search"
              placeholder="Buscar tarea"
              onChange={(event) => setSearch(event.target.value)}
            />
            <FiltersTasks
              setSelectedFilters={setSelectedFilters}
              customDate={customDate}
              setCustomDate={setCustomDate}
            />
            <GenerateActionButton
              onClick={() => {}}
              disabled={!selectedRows || selectedRows.length === 0}
            />
          </Flex>
          {isLoading ? (
            <Flex justify="center" align="center" style={{ height: "3rem" }}>
              <Spin />
            </Flex>
          ) : (
            <TaskTable
              data={data}
              modalAction={[openSendEmailModal, openMakeCalllModal]}
              setSelectedRows={setSelectedRows}
            />
          )}
        </Flex>
        <SendEmailModal
          visible={modalSendEmailVisible}
          onClose={() => setModalSendEmailVisible(false)}
          onSend={() => {}}
        />
        <MakeCallModal
          visible={modalMakeCallVisible}
          onClose={() => setModalMakeCallVisible(false)}
          onSend={() => {}}
        />
      </div>
    </>
  );
};

export default TaskManagerView;
